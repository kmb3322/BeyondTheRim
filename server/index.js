// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { runAnalysis } = require('./analysis');
const { db, authAdmin } = require('./firebaseAdmin');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// AWS S3 클라이언트
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// 미들웨어
app.use(cors());
app.use(express.json());

// 파일 업로드 미들웨어 (업로드 폴더: server/uploads)
// (옵션) 파일 크기 제한 100MB: limits: { fileSize: 100 * 1024 * 1024 }
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } 
});

/**
 * Firebase 토큰 검증 미들웨어
 * 클라이언트에서 헤더에 Authorization: Bearer <token> 형태로 보낸다고 가정
 */
async function verifyAuthToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token found' });
    }
    const token = header.split(' ')[1]; // 'Bearer ' 뒷부분
    const decodedToken = await authAdmin.verifyIdToken(token);
    req.user = decodedToken; // 인증된 유저 정보 저장
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * [1] 파일 업로드 + Firestore 기록 + 분석 로직
 * 클라이언트는 단순히 /api/upload-video 에 
 * POST FormData { video: <파일> } + 헤더에 Firebase 토큰을 담아서 전송
 */
app.post('/api/upload-video', verifyAuthToken, upload.single('video'), async (req, res) => {
  try {
    // 1) 파일 유효성 체크
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 2) S3에 업로드할 Key 생성
    const originalName = path.basename(req.file.originalname);
    const s3Key = `videos/${Date.now()}_${originalName}`;

    // 3) S3에 업로드 (Upload 클래스로 스트림 업로드)
    const fileStream = fs.createReadStream(req.file.path);
    const parallelUpload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'video/mp4', // 필요 시 실제 mime-type 사용
      },
      queueSize: 4, // 동시에 업로드할 파트 수 (기본값 4)
      partSize: 5 * 1024 * 1024, // 각 파트 크기 (예: 5MB)
      leavePartsOnError: false,
    });
    await parallelUpload.done();

    // 4) 업로드 이후 서버 로컬 임시 파일 제거 (multer가 생성한 uploads/ 파일)
    fs.unlinkSync(req.file.path);

    // 5) AI 분석 수행 (예: 분석 점수, 가공된 영상 URL 반환)
    console.log('Running ML analysis on file:', s3Key);
    const analysisResult = await runAnalysis(s3Key);

    // 6) Firestore 기록
    //  - req.user.uid: Firebase 토큰 검증으로부터 가져온 사용자 UID
    const newDocRef = db
      .collection('users')
      .doc(req.user.uid)
      .collection('shots')
      .doc(); // 자동 ID 생성

    await newDocRef.set({
      s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
      score: analysisResult.score,
      // analysisResult.processedUrl가 undefined인 경우 null 할당 (Firestore 저장 에러 예방)
      processed: analysisResult.processedUrl ?? null,
      createdAt: new Date(),
    });

    return res.json({
      message: 'Upload & analysis success',
      s3Key,
      analysisResult,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * [2] 유저의 업로드 목록을 불러오는 API
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

// 서버 실행
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
