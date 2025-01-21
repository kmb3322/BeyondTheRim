// server/api/index.js
const app = require('../app');

// Vercel은 Express 앱이 내보내는 함수를 그대로 호출할 수 있도록
module.exports = app;
