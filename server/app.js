// server/app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { runAnalysis } = require('./analysis');
const { db, authAdmin } = require('./firebaseAdmin');

// 로컬 실행 시 dotenv로 환경변수 불러오기 (production 시에는 Vercel 환경변수 사용)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// multer: 업로드 폴더는 Vercel 환경에서는 /tmp 사용, 로컬에서는 server/uploads 사용
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadDir });

// Health-check 엔드포인트 추가
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
 * /api/upload-video 엔드포인트
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

module.exports = app;
