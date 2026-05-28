'use strict';

const request = require('supertest');
const express = require('express');
const app = require('../src/app');
const errorHandler = require('../src/middlewares/errorHandler');

describe('BE-01 · Express 앱 기본 구성', () => {
  describe('GET /api/v1/health', () => {
    it('200과 { status: "ok" }를 반환한다', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('CORS', () => {
    it('CORS_ORIGIN 헤더가 응답에 포함된다', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('OPTIONS preflight 요청에 200 또는 204를 반환한다', async () => {
      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');
      expect([200, 204]).toContain(res.status);
    });
  });

  describe('JSON 파서', () => {
    it('유효한 JSON 본문을 파싱한다', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ test: true }));
      expect(res.status).toBe(200);
    });
  });

  describe('전역 에러 핸들러', () => {
    let testApp;

    beforeEach(() => {
      testApp = express();
      testApp.use(express.json());
    });

    it('정의되지 않은 경로는 404를 반환한다', async () => {
      const res = await request(app).get('/api/v1/undefined-route');
      expect(res.status).toBe(404);
    });

    it('statusCode가 있는 에러는 해당 코드와 error 구조로 응답한다', async () => {
      testApp.get('/test-error', (_req, _res, next) => {
        const err = new Error('테스트 에러');
        err.statusCode = 422;
        err.code = 'TEST_ERROR';
        next(err);
      });
      testApp.use(errorHandler);

      const res = await request(testApp).get('/test-error');
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('TEST_ERROR');
      expect(res.body.error.message).toBe('테스트 에러');
    });

    it('statusCode 없는 에러는 500 INTERNAL_ERROR를 반환한다', async () => {
      testApp.get('/test-500', (_req, _res, next) => {
        next(new Error('알 수 없는 에러'));
      });
      testApp.use(errorHandler);

      const res = await request(testApp).get('/test-500');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('에러 응답 구조는 { error: { code, message } } 형태다', async () => {
      testApp.get('/test-structure', (_req, _res, next) => {
        const err = new Error('구조 테스트');
        err.statusCode = 400;
        err.code = 'BAD_REQUEST';
        next(err);
      });
      testApp.use(errorHandler);

      const res = await request(testApp).get('/test-structure');
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
    });
  });
});
