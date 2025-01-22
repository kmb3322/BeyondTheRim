// server/app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// AWS SDK
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// 분석 로직 (예시)
const { runAnalysis } = require('./analysis');

// Firebase Admin
const { db, authAdmin } = require('./firebaseAdmin');

// 로컬 환경에서 .env 적용
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// Multer: 업로드 폴더 설정
const uploadDir =
  process.env.NODE_ENV === 'production'
    ? '/tmp'
    : path.join(__dirname, 'uploads');

const upload = multer({ dest: uploadDir });

// Health-check 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Firebase 토큰 검증 미들웨어
 */
async function verifyAuthToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token found' });
    }
    const token = header.split(' ')[1];
    const decodedToken = await authAdmin.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * /api/upload-video
 * 비디오 파일을 업로드하고 분석을 실행한 뒤,
 * Firestore에 결과를 기록하는 엔드포인트
 */
app.post('/api/upload-video', verifyAuthToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // S3에 업로드할 Key 생성
    const originalName = path.basename(req.file.originalname);
    const s3Key = `videos/${Date.now()}_${originalName}`;

    // AWS S3 클라이언트 생성
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // 파일 스트림 생성
    const fileStream = fs.createReadStream(req.file.path);

    // @aws-sdk/lib-storage의 Upload 클래스를 사용하여 업로드
    const uploadObj = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: req.file.mimetype || 'video/mp4',
      },
    });

    // 업로드 완료 대기
    await uploadObj.done();

    // 로컬/임시 파일 삭제
    fs.unlinkSync(req.file.path);

    // 영상 분석 수행
    const analysisResult = await runAnalysis(s3Key);

    // Firestore에 저장할 데이터 준비 - undefined 값 필터링
    const docData = {
      s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
      score: analysisResult.score ?? null,
      processed: analysisResult.processedUrl ?? null,
      createdAt: new Date(),
    };

    // undefined 값이 있는지 확인하고 제거
    Object.keys(docData).forEach(key => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });

    // Firestore에 기록
    const newDocRef = db
      .collection('users')
      .doc(req.user.uid)
      .collection('shots')
      .doc();

    await newDocRef.set(docData);

    res.json({
      message: 'Upload & analysis success',
      s3Key,
      analysisResult,
    });
  } catch (err) {
    console.error('Upload endpoint error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 유저의 업로드 목록을 불러오는 API
 * 클라이언트는 헤더에 Firebase 토큰을 넣어서 GET /api/user-shots 요청
 */
app.get('/api/user-shots', verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const shotsRef = db
      .collection('users')
      .doc(userId)
      .collection('shots')
      .orderBy('createdAt', 'asc');

    const snapshot = await shotsRef.get();
    const shots = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ shots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch user shots' });
  }
});

module.exports = app;
