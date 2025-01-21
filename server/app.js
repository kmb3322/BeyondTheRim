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

// 로컬 실행 시 dotenv로 환경변수 불러오기 (production 시에는 Vercel 환경변수 사용)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(cors());
app.use(express.json());

// multer 설정: production 시 '/tmp', 로컬은 server/uploads 폴더 사용
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, 'uploads');
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
      return res.status(401).json({ message: '토큰이 존재하지 않습니다.' });
    }
    const token = header.split(' ')[1];
    const decodedToken = await authAdmin.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('토큰 검증 에러:', error);
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}

/**
 * /api/upload-video 엔드포인트
 */
app.post('/api/upload-video', verifyAuthToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '업로드된 파일이 없습니다.' });
    }

    // S3에 업로드할 Key 생성 (예: videos/타임스탬프_원본파일명)
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

    // @aws-sdk/lib-storage의 Upload 클래스를 사용하여 스트림 업로드
    const uploadParams = {
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: req.file.mimetype || 'video/mp4',
      },
    };

    const parallelUploads3 = new Upload(uploadParams);

    // 업로드 진행 상황 로깅 (선택사항)
    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log('업로드 진행 중:', progress);
    });

    // 업로드 완료 대기
    await parallelUploads3.done();

    // 업로드 완료 후 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    // 영상 분석 수행 (runAnalysis 함수 내 구현)
    console.log(`Running ML analysis on file: ${s3Key}`);
    const analysisResult = await runAnalysis(s3Key);

    // analysisResult.processedUrl가 undefined인 경우 null을 할당
    const processedUrl = analysisResult.processedUrl !== undefined ? analysisResult.processedUrl : null;

    // Firestore에 기록
    const newDocRef = db
      .collection('users')
      .doc(req.user.uid)
      .collection('shots')
      .doc();

    await newDocRef.set({
      s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
      score: analysisResult.score,
      processed: processedUrl,
      createdAt: new Date(),
    });

    res.json({
      message: '업로드 및 분석 성공',
      s3Key,
      analysisResult,
    });
  } catch (err) {
    console.error('업로드 엔드포인트 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

/**
 * [2] 유저의 업로드 목록을 불러오는 API
 * 클라이언트는 헤더에 Firebase 토큰을 넣어서 GET /api/user-shots 요청
 */
app.get('/api/user-shots', verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Firestore에서 해당 유저의 shots 컬렉션을 createdAt 기준 오름차순으로 가져옴
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

    res.json({ shots });
  } catch (error) {
    console.error('유저 샷 조회 에러:', error);
    res.status(500).json({ message: '유저 샷 조회 실패' });
  }
});

module.exports = app;
