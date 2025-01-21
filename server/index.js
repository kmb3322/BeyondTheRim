// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { runAnalysis } = require('./analysis');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// AWS S3 클라이언트 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// CORS 및 JSON 파싱 미들웨어 설정
app.use(cors());
app.use(express.json());

// multer: 파일 업로드 처리용 미들웨어
const upload = multer({ dest: 'uploads/' });

// [1] presigned URL 발급 엔드포인트
app.post('/api/get-presigned-url', async (req, res) => {
  try {
    const { filename } = req.body;
    const fileExtension = path.extname(filename);
    const newFilename = `videos/${Date.now()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: newFilename,
      ContentType: 'video/mp4', // 필요시 동적으로 설정
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({
      presignedUrl,
      s3ObjectKey: newFilename,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating presigned URL' });
  }
});

// [2] 직접 파일 업로드 처리 엔드포인트
app.post('/api/upload-direct', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const fileContent = require('fs').createReadStream(req.file.path);
    const s3Key = `videos/${Date.now()}_${req.file.originalname}`;

    const putCmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'video/mp4',
    });

    await s3.send(putCmd);

    const analysisResult = await runAnalysis(s3Key);

    res.json({
      s3Key,
      analysisResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading file to S3' });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
