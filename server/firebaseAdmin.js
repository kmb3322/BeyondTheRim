// server/firebaseAdmin.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// 환경변수에서 서비스 계정 정보 불러오기
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});


const db = admin.firestore();
const authAdmin = admin.auth();

module.exports = { db, authAdmin };
