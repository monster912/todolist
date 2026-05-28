'use strict';

const app = require('./src/app');
const { testConnection } = require('./src/db/pool');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.warn(`서버가 포트 ${PORT}에서 실행 중입니다. (NODE_ENV=${process.env.NODE_ENV})`);
  testConnection().catch((err) => {
    console.error('DB 연결 실패로 서버를 종료합니다:', err.message);
    process.exit(1);
  });
});
