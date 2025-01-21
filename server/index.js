// api/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { runAnalysis } = require('../server/analysis'); // analysis.js 파일의 경로에 맞춰 수정
const { db, authAdmin } = require('../server/firebaseAdmin'); // firebaseAdmin.js 파일의 경로에 맞춰 수정
// dotenv는 로컬 실행 시만 필요 (Vercel에서는 환경변수 Dashboard에 설정)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// multer: 파일 업로드 미들웨어 (임시 업로드 폴더: /tmp 는 Vercel 환경에서도 사용 가능)
const upload = multer({ dest: '/tmp' });

// Health-check 엔드포인트 추가
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Firebase 토큰 검증 미들웨어
 * 클라이언트는 헤더에 Authorization: Bearer <token> 형태로 전송해야 함
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
 * /api/upload-video 엔드포인트 처리
 */
app.post('/api/upload-video', verifyAuthToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // S3에 업로드할 Key 생성
    const originalName = path.basename(req.file.originalname);
    const s3Key = `videos/${Date.now()}_${originalName}`;

    // AWS S3 클라이언트 설정
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // 파일 스트림 생성
    const fileStream = fs.createReadStream(req.file.path);
    const putCmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: req.file.mimetype || 'video/mp4',
    });
    await s3.send(putCmd);

    // 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    // 영상 분석 수행
    const analysisResult = await runAnalysis(s3Key);

    // Firestore 기록
    const newDocRef = db
      .collection('users')
      .doc(req.user.uid)
      .collection('shots')
      .doc();

    await newDocRef.set({
      s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
      score: analysisResult.score,
      processed: analysisResult.processedUrl,
      createdAt: new Date(),
    });

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

// Express 앱을 Vercel Serverless Function 핸들러로 내보내기
module.exports = app;
