// server/app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const { runAnalysis } = require('./analysis');
const { db, authAdmin } = require('./firebaseAdmin');

// 로컬에서는 dotenv 로드 (Vercel에선 환경변수 사용)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(cors());
app.use(express.json());

// multer 설정: production이면 /tmp, 로컬이면 ./uploads
const uploadDir =
  process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadDir });

// 간단한 헬스 체크
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
 * 클라이언트에서 영상 업로드 요청을 받으면 S3에 업로드 후 Firestore에 문서 생성
 * "머신러닝 처리는 ml_computer 쪽에서" 추가로 수행 → Firestore 문서 업데이트
 */
app.post('/api/upload-video', verifyAuthToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 파일 정보
    const originalName = path.basename(req.file.originalname);
    const s3Key = `videos/${Date.now()}_${originalName}`;

    // AWS S3 클라이언트
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // 파일 스트림 생성
    const fileStream = fs.createReadStream(req.file.path);

    // 파일 S3 업로드
    const uploadObj = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: req.file.mimetype || 'video/mp4',
      },
    });

    await uploadObj.done();

    // 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    // 간단한 서버 측 분석(혹은 무의미): runAnalysis
    const analysisResult = await runAnalysis(s3Key);

    // Firestore에 문서 생성
    const newDocRef = db
      .collection('users')
      .doc(req.user.uid)
      .collection('shots')
      .doc();

    // 아직 머신러닝 처리는 완료되지 않았으므로 processedUrl 등은 null(또는 undefined -> null)
    await newDocRef.set({
      s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
      score: analysisResult.score ?? 0,
      processed: analysisResult.processedUrl ?? null,
      analysis: null, // 머신러닝 처리 결과가 들어갈 필드(처음엔 null)
      newUrl: null,   // 머신러닝 처리 후 새 영상을 S3에 업로드하면 여기에 URL 업데이트
      createdAt: new Date(),
    });

    res.json({
      message: 'Upload & analysis success',
      s3Key,
    });
  } catch (err) {
    console.error('Upload endpoint error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 유저 업로드 목록 조회
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
