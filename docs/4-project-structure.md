# 프로젝트 구조 설계 원칙 - Todo List

| 항목        | 내용                   |
| ----------- | ---------------------- |
| 버전        | 1.0.0                  |
| 상태        | 확정                   |
| 작성일      | 2026-05-27             |
| 최종 수정일 | 2026-05-27             |
| 작성자      | ochlo                  |
| 참조 문서   | `docs/2-PRD.md` v2.0.0 |

---

## 목차

1. [최상위 공통 원칙](#1-최상위-공통-원칙)
2. [의존성·레이어 원칙](#2-의존성레이어-원칙)
3. [코드·네이밍 원칙](#3-코드네이밍-원칙)
4. [테스트·품질 원칙](#4-테스트품질-원칙)
5. [설정·보안·운영 원칙](#5-설정보안운영-원칙)
6. [디렉토리 구조](#6-디렉토리-구조)

---

## 1. 최상위 공통 원칙

> 프론트엔드·백엔드 모든 코드에 공통 적용되는 아키텍처 원칙이다.
> 1인 2일 MVP 제약을 전제로 실용성을 최우선으로 한다.

### P-01 단일 책임 (Single Responsibility)

하나의 파일·함수·컴포넌트는 하나의 역할만 수행한다.

- 백엔드: 라우터는 라우팅만, 컨트롤러는 요청/응답 변환만, db 쿼리 함수는 SQL 실행만 담당한다.
- 프론트엔드: 페이지 컴포넌트는 레이아웃과 훅 조합만, 훅은 서버 상태 관리만, 스토어는 클라이언트 상태만 담당한다.

### P-02 관심사 분리 (Separation of Concerns)

비즈니스 로직·데이터 접근·HTTP 처리를 물리적으로 분리한다.

- 비즈니스 규칙(소유권 검증, status 계산, 카테고리 이관)은 컨트롤러 또는 전용 유틸에 위치한다.
- SQL은 `db/` 계층에만 존재한다. 컨트롤러에 직접 쿼리 문자열을 작성하지 않는다.
- UI 렌더링 로직은 컴포넌트에, 서버 통신은 훅에, 전역 상태는 스토어에 둔다.

### P-03 단순성 우선 (Simplicity First)

2일 제약 안에서 완성 가능한 최소한의 구조를 선택한다.

- 불필요한 추상화 계층(서비스 레이어, 리포지토리 패턴 등)을 생략한다.
- 백엔드: `routes → controllers → db` 3계층으로 단순하게 유지한다.
- 프론트엔드: 전역 상태는 `stores/`에, 서버 상태는 TanStack Query 훅에 집중한다.
- 나중에 필요할 것 같아서 추가하는 코드는 작성하지 않는다.

### P-04 일관성 (Consistency)

같은 종류의 문제는 항상 같은 방식으로 해결한다.

- API 응답 형식, 에러 코드, 네이밍 컨벤션은 이 문서의 규칙을 따른다.
- 예외 없이 파라미터화 쿼리를 사용한다.
- 모든 보호 라우트에는 동일한 인증 미들웨어를 적용한다.

### P-05 명시적 소유권 검증 (Explicit Ownership)

모든 데이터 변경·조회 요청에서 `user_id` 기반 소유권 검증을 명시적으로 수행한다.

- JWT에서 추출한 `user_id`와 리소스의 `user_id`를 WHERE 절 또는 조회 후 비교로 검증한다.
- 소유권 검증을 미들웨어로 추상화하지 않는다. 각 쿼리 함수에서 명시적으로 처리한다.

### P-06 파생값 런타임 계산 (Derived Value at Runtime)

`status`(NOT_STARTED / IN_PROGRESS / DONE / OVERDUE)는 DB에 저장하지 않는다.

- 백엔드: 조회 결과를 클라이언트에 반환하기 전 컨트롤러에서 계산하여 응답 객체에 추가한다.
- 프론트엔드: 백엔드에서 전달된 `status` 값을 그대로 사용하며 재계산하지 않는다.

---

## 2. 의존성·레이어 원칙

### 2.1 백엔드 레이어 정의

```
[HTTP 요청]
    ↓
[routes/]          라우팅 정의 · 미들웨어 체인 연결
    ↓
[middlewares/]     인증(JWT 검증) · 요청 유효성 검사
    ↓
[controllers/]     요청 파싱 · 비즈니스 로직 조율 · 응답 직렬화
    ↓
[db/]              pg 파라미터화 쿼리 실행 · 결과 반환
    ↓
[PostgreSQL 17]
```

**레이어별 책임 경계**

| 레이어         | 허용                                                | 금지                                        |
| -------------- | --------------------------------------------------- | ------------------------------------------- |
| `routes/`      | 경로 정의, 미들웨어 적용, 컨트롤러 연결             | 비즈니스 로직, SQL                          |
| `middlewares/` | JWT 파싱, 입력값 검증, 403/401 응답                 | DB 접근, 응답 본문 생성                     |
| `controllers/` | 비즈니스 로직, db 함수 호출, status 계산, 응답 생성 | 직접 SQL 작성, res.send 외 직접 스트림 처리 |
| `db/`          | SQL 쿼리 실행, 결과 반환                            | HTTP 관련 객체 접근(req/res), 비즈니스 판단 |

### B-01 레이어 의존 방향

```
routes → middlewares → controllers → db → pg
```

역방향 의존은 절대 금지한다. `db/`가 `controllers/`를 import하거나,
`routes/`가 `db/`를 직접 호출하지 않는다.

### B-02 순환 의존 금지

두 모듈이 서로를 require/import하는 구조를 금지한다.
공통 로직이 필요하면 `utils/`로 분리한다.

### B-03 미들웨어 적용 범위

- `authenticate` 미들웨어: 인증이 필요한 모든 라우터에 router 수준으로 적용한다.
- 유효성 검사 미들웨어: 각 라우트 핸들러에 개별 적용한다.
- 전역 에러 핸들러: `app.js`에 마지막으로 등록한다.

---

### 2.2 프론트엔드 레이어 정의

```
[pages/]           라우트 컴포넌트 · 페이지 레이아웃 조합
    ↓ 사용
[components/]      재사용 UI 컴포넌트 (표현 전담)
    ↓ 사용
[hooks/]           TanStack Query 훅 (서버 상태)
[stores/]          Zustand 스토어 (클라이언트 상태)
    ↓ 사용
[api/]             HTTP 클라이언트 · 엔드포인트 함수
    ↓
[Backend API]
```

### F-01 서버 상태와 클라이언트 상태 분리

- 서버에서 오는 데이터(할일 목록, 카테고리 목록): TanStack Query 훅 (`hooks/`)에서 관리한다.
- 클라이언트 전용 상태(선택된 카테고리 필터, 모달 열림/닫힘, JWT 토큰, 사용자 정보): Zustand 스토어 (`stores/`)에서 관리한다.
- TanStack Query 캐시를 Zustand로 직접 조작하지 않는다.

### F-02 페이지 컴포넌트 제약

`pages/`의 컴포넌트는 레이아웃과 훅/스토어 조합만 담당한다.
직접적인 API 호출(`fetch`, `axios`)을 페이지 컴포넌트에서 작성하지 않는다.
반드시 `hooks/` 또는 `api/`를 경유한다.

### F-03 컴포넌트 단방향 데이터 흐름

props는 부모에서 자식 방향으로만 전달한다.
자식이 부모 상태를 변경해야 할 경우 콜백 props 또는 스토어를 사용한다.

### F-04 API 클라이언트 단일 진입점

모든 HTTP 요청은 `api/` 디렉토리의 함수를 통해서만 수행한다.
Authorization 헤더 주입, 기본 URL 설정, 공통 에러 처리는 `api/client.ts`에 집중한다.

---

## 3. 코드·네이밍 원칙

### 3.1 공통 규칙

### N-01 언어 분리

- 파일명, 변수명, 함수명, 컴포넌트명: 영어 카멜케이스/파스칼케이스
- 주석, 커밋 메시지: 한국어 허용

### N-02 파일명 컨벤션

| 대상                 | 규칙                           | 예시                                     |
| -------------------- | ------------------------------ | ---------------------------------------- |
| React 컴포넌트 파일  | PascalCase                     | `TodoCard.tsx`, `CategoryBadge.tsx`      |
| React 페이지 파일    | PascalCase                     | `DashboardPage.tsx`, `LoginPage.tsx`     |
| 커스텀 훅 파일       | camelCase, `use` 접두사        | `useTodos.ts`, `useCategories.ts`        |
| Zustand 스토어 파일  | camelCase, `Store` 접미사      | `authStore.ts`, `uiStore.ts`             |
| API 클라이언트 파일  | camelCase                      | `todoApi.ts`, `authApi.ts`               |
| 타입 정의 파일       | camelCase                      | `todo.types.ts`, `api.types.ts`          |
| 백엔드 라우터 파일   | camelCase, `Routes` 접미사     | `todoRoutes.js`, `authRoutes.js`         |
| 백엔드 컨트롤러 파일 | camelCase, `Controller` 접미사 | `todoController.js`, `authController.js` |
| 백엔드 미들웨어 파일 | camelCase                      | `authenticate.js`, `validateTodo.js`     |
| 백엔드 DB 쿼리 파일  | camelCase, `Queries` 접미사    | `todoQueries.js`, `userQueries.js`       |

---

### 3.2 프론트엔드 네이밍

### N-03 React 컴포넌트

- 컴포넌트명: PascalCase (`TodoItem`, `CategoryFilter`)
- props 타입 명: `컴포넌트명 + Props` (`TodoItemProps`, `CategoryFilterProps`)
- 이벤트 핸들러 prop: `on + 이벤트명` (`onDelete`, `onStatusChange`)
- 이벤트 핸들러 함수: `handle + 이벤트명` (`handleDelete`, `handleStatusChange`)

### N-04 TanStack Query 훅

```typescript
// 조회 훅: use + 복수 엔티티명
useTodos()
useCategories()

// 단건 조회 훅: use + 단수 엔티티명
useTodo(id: string)
useCategory(id: string)

// 뮤테이션 훅: use + 동사 + 엔티티명
useCreateTodo()
useUpdateTodo()
useDeleteTodo()
useToggleTodoDone()
```

Query key 배열 구조:

```typescript
// 목록: ['todos'] 또는 ['todos', { categoryId, status }]
// 단건: ['todos', id]
// 카테고리: ['categories']
```

### N-05 Zustand 스토어

```typescript
// 스토어 파일: authStore.ts, uiStore.ts
// 스토어 훅 이름: useAuthStore, useUiStore

// 상태(state): 명사 또는 형용사
// token, user, isLoading, selectedCategoryId

// 액션(action): 동사 + 명사
// setToken, clearAuth, setSelectedCategory
```

---

### 3.3 백엔드 네이밍

### N-06 라우터 함수명

```javascript
// routes/todoRoutes.js
router.get("/", todoController.getAll);
router.post("/", todoController.create);
router.get("/:id", todoController.getOne);
router.put("/:id", todoController.update);
router.delete("/:id", todoController.remove);
router.patch("/:id/done", todoController.toggleDone);
```

### N-07 컨트롤러 함수명

| 동작         | 함수명       |
| ------------ | ------------ |
| 목록 조회    | `getAll`     |
| 단건 조회    | `getOne`     |
| 생성         | `create`     |
| 수정         | `update`     |
| 삭제         | `remove`     |
| 완료 토글    | `toggleDone` |
| 로그인       | `login`      |
| 회원가입     | `register`   |
| 내 정보 조회 | `getMe`      |

### N-08 DB 쿼리 함수명

```javascript
// db/todoQueries.js
findAllByUserId(userId, filters);
findByIdAndUserId(id, userId); // 소유권 포함 조회
insertTodo(data);
updateTodo(id, userId, data); // userId 필수 포함
deleteTodo(id, userId);
```

### N-09 미들웨어 함수명

```javascript
// 인증 미들웨어
authenticate; // JWT 검증, req.user 주입

// 유효성 검사 미들웨어 (파일명: validateTodo.js 등)
validateCreateTodo;
validateUpdateTodo;
validateCreateCategory;
```

---

### 3.4 API 응답 형식 통일

### N-10 성공 응답 구조

```json
// 단건 응답
{
  "data": { ... }
}

// 목록 응답
{
  "data": [ ... ],
  "total": 42
}

// 생성/수정 후 리소스 없는 경우
{
  "message": "success"
}
```

### N-11 에러 응답 구조

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목은 1자 이상 200자 이하여야 합니다."
  }
}
```

### N-12 에러 코드 목록

| 코드                      | HTTP 상태 | 설명                     |
| ------------------------- | --------- | ------------------------ |
| `UNAUTHORIZED`            | 401       | 인증 토큰 없음 또는 만료 |
| `FORBIDDEN`               | 403       | 타인 리소스 접근 시도    |
| `NOT_FOUND`               | 404       | 리소스 없음              |
| `VALIDATION_ERROR`        | 400       | 입력값 형식 오류         |
| `DUPLICATE_EMAIL`         | 409       | 이메일 중복              |
| `DUPLICATE_CATEGORY`      | 409       | 카테고리명 중복          |
| `INVALID_CREDENTIALS`     | 401       | 이메일/비밀번호 불일치   |
| `DEFAULT_CATEGORY_DELETE` | 400       | 기본 카테고리 삭제 시도  |
| `INTERNAL_ERROR`          | 500       | 서버 내부 오류           |

---

## 4. 테스트·품질 원칙

> 1인 2일 제약 하에서 전수 테스트 커버리지보다 핵심 안전망 확보를 우선한다.

### Q-01 테스트 우선순위 (3-tier)

**Tier 1 - 반드시 검증 (구현과 동시에 작성)**

- JWT 인증 미들웨어: 유효 토큰 / 만료 토큰 / 토큰 없음 케이스
- 소유권 검증: 타인 리소스 접근 시 403 반환 확인
- 입력값 유효성: 필수 필드 누락, 형식 오류(email, password 8자+영문+숫자, 날짜 순서)
- 카테고리 삭제 → 할일 기본 카테고리 이관 로직

**Tier 2 - 가능하면 검증 (MVP 완성 후 추가)**

- 각 CRUD 엔드포인트 정상 흐름 (해피 패스)
- status 파생값 계산 로직 단위 테스트
- 기본 카테고리 삭제 방지

**Tier 3 - 시간 여유 시 검증**

- 경계값 테스트 (200자 제목, 50자 카테고리명 등)
- 동시성 관련 시나리오
- 프론트엔드 컴포넌트 렌더링 테스트

### Q-02 테스트 도구

- 백엔드: Jest + supertest (통합 테스트 위주)
- 프론트엔드: Tier 2까지는 수동 검증. 시간 여유 시 Vitest + React Testing Library

### Q-03 테스트 데이터 격리

- 각 테스트는 독립적인 사용자 계정으로 수행한다.
- `beforeEach`에서 테스트 데이터 생성, `afterEach`에서 삭제한다.
- 테스트용 DB를 별도 운영하거나, 테스트 환경 변수로 DB를 분리한다.

### Q-04 코드 품질 기준

**백엔드 (Node.js)**

- ESLint: `eslint:recommended` 규칙 적용
- 들여쓰기: 2 spaces
- 세미콜론: 필수
- `console.log` 디버깅 코드: 커밋 전 제거 (에러 로깅은 허용)
- `async/await` 사용, 콜백 패턴 사용 금지

**프론트엔드 (TypeScript)**

- ESLint + TypeScript ESLint 플러그인 적용
- `any` 타입: 금지 (불가피 시 `// eslint-disable` 주석과 이유 명시)
- Prettier: 자동 포맷 적용
- 들여쓰기: 2 spaces

### Q-05 PR/커밋 전 자가 체크리스트

```
[ ] 소유권 검증 WHERE 조건에 user_id 포함 여부 확인
[ ] 모든 SQL이 파라미터화 쿼리($1, $2...)인지 확인
[ ] .env 값이 코드에 하드코딩되어 있지 않은지 확인
[ ] 에러 응답이 N-11 표준 형식을 따르는지 확인
[ ] 새로 추가한 보호 라우트에 authenticate 미들웨어 적용 여부 확인
```

---

## 5. 설정·보안·운영 원칙

### S-01 환경 변수 구조

프로젝트 루트에 `.env` 파일 하나로 관리한다. `.env`는 `.gitignore`에 반드시 포함한다.
`.env.example`을 함께 커밋하여 필요한 키 목록을 공유한다.

```dotenv
# .env.example

# 서버
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# DB
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT_MS=30000

# bcrypt
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:5173
```

**프론트엔드 환경 변수** (Vite 기준, `frontend/.env.example`)

```dotenv
# API 서버 기본 URL
VITE_API_BASE_URL=http://localhost:3000/api/v1

# 기본 언어 (ko | en)
VITE_DEFAULT_LOCALE=ko

# 기본 테마 (light | dark)
VITE_DEFAULT_THEME=light
```

> Vite 환경 변수는 `VITE_` 접두사가 없으면 클라이언트 번들에 포함되지 않는다.
> 코드에서는 `import.meta.env.VITE_API_BASE_URL` 형태로 접근한다.

### S-02 JWT 설정 원칙

- `JWT_SECRET`: 최소 32자 이상의 랜덤 문자열. 추측 불가능한 값 사용.
- `JWT_EXPIRES_IN`: `7d` (7일). 리프레시 토큰은 MVP 범위 외이므로 구현하지 않는다.
- 토큰 payload에 포함할 최소 정보: `{ userId, email, iat, exp }`
- 토큰을 `localStorage`에 저장한다 (MVP 기준; httpOnly 쿠키는 Nice to Have).
- 만료된 토큰 요청 시 `401 UNAUTHORIZED` 응답, 프론트엔드는 로그인 페이지로 리다이렉트.

### S-03 bcrypt 설정

- `BCRYPT_SALT_ROUNDS`: `12` (보안성과 속도의 균형점).
- 비밀번호 비교는 반드시 `bcrypt.compare()`를 사용한다. 문자열 직접 비교 금지.
- 응답 객체에서 `password` 필드는 반드시 제거한다.

```javascript
// 올바른 예
const { password, ...userWithoutPassword } = user;
res.json({ data: userWithoutPassword });
```

### S-04 DB 연결 풀 설정

```javascript
// db/pool.js
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

- `pool.query()`를 직접 사용하지 않는다. 반드시 `db/` 계층 함수를 통해 접근한다.
- 트랜잭션이 필요한 경우 (카테고리 삭제 → 할일 이관): `pool.connect()`로 클라이언트를 획득하여 수동 트랜잭션을 사용한다.

```javascript
// 트랜잭션 패턴
const client = await pool.connect();
try {
  await client.query("BEGIN");
  // ... 쿼리 실행
  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release();
}
```

### S-05 CORS 설정

```javascript
// app.js
const cors = require("cors");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // 프론트엔드 개발 서버 주소
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

프로덕션 환경에서 `CORS_ORIGIN`은 실제 프론트엔드 도메인으로 제한한다.
와일드카드(`*`) 사용을 금지한다.

### S-06 SQL Injection 방지

모든 SQL은 파라미터화 쿼리를 사용한다. 문자열 보간(`${}`) 또는 연결(`+`)로 SQL을 조립하지 않는다.

```javascript
// 금지
const query = `SELECT * FROM todos WHERE id = '${id}'`;

// 허용
const query = "SELECT * FROM todos WHERE id = $1 AND user_id = $2";
const result = await pool.query(query, [id, userId]);
```

### S-07 에러 핸들링 구조

```javascript
// app.js - 전역 에러 핸들러 (마지막에 등록)
app.use((err, req, res, next) => {
  console.error(err);

  // 알려진 에러
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // 예상치 못한 에러 - 내부 정보 노출 금지
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
  });
});
```

컨트롤러에서 에러 발생 시 `next(err)`로 전달한다. `try-catch` 없이 `throw`하지 않는다.

### S-08 민감 정보 노출 방지

- 500 에러 응답에 스택 트레이스, SQL 에러 메시지, DB 구조를 포함하지 않는다.
- `NODE_ENV=production`에서 상세 에러 로그는 서버 콘솔에만 출력한다.
- JWT 서명 실패 에러 메시지를 그대로 클라이언트에 전달하지 않는다.

---

## 6. 디렉토리 구조

### 6.1 최상위 구조

```
todolist/
├── frontend/                  # React 19 + TypeScript 앱
├── backend/                   # Node.js + Express 앱
├── docs/                      # 설계 문서
│   ├── 1-domain-definition.md
│   ├── 2-PRD.md
│   ├── 3-user-scenario.md
│   └── 4-project-structure.md (이 파일)
├── .gitignore
└── README.md
```

---

### 6.2 프론트엔드 디렉토리 구조

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                   # HTTP 클라이언트 및 API 엔드포인트 함수
│   │   ├── client.ts          # axios 인스턴스, 기본 URL, 인터셉터 (토큰 주입, 401 처리)
│   │   ├── authApi.ts         # 인증 API 함수 (login, register, getMe)
│   │   ├── todoApi.ts         # 할일 API 함수 (getTodos, createTodo, updateTodo, deleteTodo, toggleDone)
│   │   └── categoryApi.ts     # 카테고리 API 함수 (getCategories, createCategory, updateCategory, deleteCategory)
│   │
│   ├── components/            # 재사용 가능한 공통 UI 컴포넌트
│   │   ├── common/            # 도메인 무관 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── todo/              # 할일 도메인 컴포넌트
│   │   │   ├── TodoCard.tsx       # 할일 단건 카드 UI
│   │   │   ├── TodoList.tsx       # 할일 목록 렌더링
│   │   │   ├── TodoForm.tsx       # 할일 생성/수정 폼
│   │   │   └── StatusBadge.tsx    # status 뱃지 (NOT_STARTED 등)
│   │   └── category/          # 카테고리 도메인 컴포넌트
│   │       ├── CategoryFilter.tsx # 카테고리 필터 탭/버튼
│   │       └── CategoryForm.tsx   # 카테고리 생성/수정 폼
│   │
│   ├── hooks/                 # TanStack Query 커스텀 훅 (서버 상태)
│   │   ├── useTodos.ts        # useQuery: 할일 목록 조회 (필터 포함)
│   │   ├── useTodo.ts         # useQuery: 할일 단건 조회
│   │   ├── useTodoMutations.ts # useMutation: create/update/delete/toggleDone
│   │   ├── useCategories.ts   # useQuery: 카테고리 목록
│   │   └── useCategoryMutations.ts # useMutation: create/update/delete
│   │
│   ├── stores/                # Zustand 스토어 (클라이언트 상태)
│   │   ├── authStore.ts       # 인증 상태: token, user, setToken, clearAuth
│   │   └── uiStore.ts         # UI 상태: selectedCategoryId, statusFilter
│   │
│   ├── pages/                 # 라우트별 페이지 컴포넌트
│   │   ├── LoginPage.tsx      # S-01: 로그인
│   │   ├── RegisterPage.tsx   # S-02: 회원가입
│   │   ├── DashboardPage.tsx  # S-03: 대시보드 (할일 목록 + 필터)
│   │   ├── TodoCreatePage.tsx # S-04: 할일 등록
│   │   ├── TodoEditPage.tsx   # S-05: 할일 수정
│   │   ├── TodoDetailPage.tsx # S-06: 할일 상세
│   │   ├── CategoryPage.tsx   # S-07: 카테고리 관리
│   │   └── SettingsPage.tsx   # S-08: 설정 (테마/언어)
│   │
│   ├── locales/               # react-i18next 번역 파일
│   │   ├── ko/
│   │   │   └── translation.json   # 한국어 번역 키-값
│   │   └── en/
│   │       └── translation.json   # 영어 번역 키-값
│   │
│   ├── types/                 # TypeScript 타입 정의
│   │   ├── todo.types.ts      # Todo, TodoStatus, CreateTodoInput, UpdateTodoInput
│   │   ├── category.types.ts  # Category, CreateCategoryInput
│   │   ├── user.types.ts      # User, AuthUser
│   │   └── api.types.ts       # ApiResponse<T>, ApiError, PaginatedResponse<T>
│   │
│   ├── utils/                 # 순수 유틸 함수
│   │   ├── dateUtils.ts       # 날짜 포맷, 비교 함수
│   │   └── validators.ts      # 프론트엔드 입력값 검증 함수
│   │
│   ├── router/                # React Router 설정
│   │   └── index.tsx          # 라우트 정의, PrivateRoute 컴포넌트
│   │
│   ├── i18n.ts                # react-i18next 초기화 설정
│   ├── App.tsx                # 루트 컴포넌트 (QueryClientProvider, 라우터)
│   └── main.tsx               # 엔트리포인트
│
├── .env                       # 환경 변수 (gitignore)
├── .env.example               # 환경 변수 예시
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**디렉토리별 배치 기준 요약**

| 디렉토리      | 배치 기준                                                                            |
| ------------- | ------------------------------------------------------------------------------------ |
| `api/`        | API 서버와 통신하는 모든 코드. 비즈니스 로직 없음. 순수 HTTP 호출 함수만             |
| `components/` | 2개 이상의 페이지에서 재사용되거나, 단일 페이지라도 독립적으로 의미가 있는 UI 단위   |
| `hooks/`      | TanStack Query `useQuery` / `useMutation`을 래핑하는 훅만 위치. 서버 상태 전담       |
| `stores/`     | 서버 응답 없이 클라이언트 내부에서만 유지되는 상태 (인증 토큰, UI 필터 등)           |
| `pages/`      | 라우트 1개에 대응하는 컴포넌트. `hooks/`와 `stores/`를 조합하고 `components/`를 배치 |
| `locales/`    | i18n 번역 JSON 파일만. 로직 없음                                                     |
| `types/`      | 런타임 코드 없는 순수 타입 선언 파일만                                               |
| `utils/`      | 특정 도메인에 종속되지 않는 순수 함수. React/쿼리/스토어 의존 없음                   |

---

### 6.3 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── routes/                # Express 라우터 (URL → 미들웨어 → 컨트롤러 연결)
│   │   ├── index.js           # 모든 라우터를 /api/v1 하위로 마운트
│   │   ├── authRoutes.js      # POST /auth/register, POST /auth/login, GET /auth/me
│   │   ├── todoRoutes.js      # GET|POST /todos, GET|PUT|DELETE|PATCH /todos/:id
│   │   ├── categoryRoutes.js  # GET|POST /categories, PUT|DELETE /categories/:id
│   │   └── userRoutes.js      # PATCH /users/me/settings (테마/언어 설정)
│   │
│   ├── controllers/           # 요청 처리, 비즈니스 로직, 응답 생성
│   │   ├── authController.js  # register, login, getMe
│   │   ├── todoController.js  # getAll, getOne, create, update, remove, toggleDone
│   │   ├── categoryController.js # getAll, create, update, remove
│   │   └── userController.js  # updateSettings
│   │
│   ├── middlewares/           # 재사용 가능한 미들웨어 함수
│   │   ├── authenticate.js    # JWT 검증 → req.user = { userId, email } 주입
│   │   ├── validateAuth.js    # 회원가입/로그인 입력값 검증
│   │   ├── validateTodo.js    # 할일 생성/수정 입력값 검증
│   │   └── validateCategory.js # 카테고리 생성/수정 입력값 검증
│   │
│   ├── db/                    # pg 쿼리 함수 (SQL 전담 계층)
│   │   ├── pool.js            # pg Pool 인스턴스 생성 및 export
│   │   ├── userQueries.js     # findByEmail, findById, insertUser, updateSettings
│   │   ├── todoQueries.js     # findAllByUserId, findByIdAndUserId, insertTodo, updateTodo, deleteTodo
│   │   └── categoryQueries.js # findAllByUserId, findByIdAndUserId, insertCategory, updateCategory, deleteCategory, reassignTodosToDefault
│   │
│   ├── utils/                 # 공통 유틸 함수
│   │   ├── jwtUtils.js        # signToken, verifyToken
│   │   ├── statusUtils.js     # computeTodoStatus(todo, now) → NOT_STARTED | IN_PROGRESS | DONE | OVERDUE
│   │   ├── errorUtils.js      # createError(code, message, statusCode) 팩토리 함수
│   │   └── responseUtils.js   # sendSuccess(res, data), sendError(res, code, message, status)
│   │
│   └── app.js                 # Express 앱 설정 (미들웨어 등록, 라우터 마운트, 에러 핸들러)
│
├── migrations/                # DB 마이그레이션 SQL 파일
│   ├── 001_create_users.sql
│   ├── 002_create_categories.sql
│   └── 003_create_todos.sql
│
├── tests/                     # 테스트 파일
│   ├── auth.test.js           # 인증 흐름 통합 테스트
│   ├── todo.test.js           # 할일 CRUD + 소유권 테스트
│   └── category.test.js       # 카테고리 CRUD + 삭제 이관 테스트
│
├── .env                       # 환경 변수 (gitignore)
├── .env.example               # 환경 변수 예시
├── .eslintrc.js               # ESLint 설정
├── server.js                  # HTTP 서버 시작 진입점 (app.js import → listen)
├── jest.config.js
└── package.json
```

**디렉토리별 배치 기준 요약**

| 디렉토리       | 배치 기준                                                                            |
| -------------- | ------------------------------------------------------------------------------------ |
| `routes/`      | URL 경로 정의, 미들웨어 체인, 컨트롤러 함수 연결만. 로직 없음                        |
| `controllers/` | `req` 파싱, `db/` 함수 호출, status 계산, `res` 응답 생성. SQL 직접 작성 금지        |
| `middlewares/` | 여러 라우트에서 재사용되는 요청 전처리. `next()` 또는 에러 응답만 반환               |
| `db/`          | pg pool 쿼리 실행만. HTTP, 비즈니스 로직 없음. 파라미터화 쿼리 필수                  |
| `utils/`       | 특정 레이어에 종속되지 않는 순수 함수. JWT 서명/검증, status 계산, 에러 객체 생성 등 |
| `migrations/`  | 순번 + 설명 형태의 SQL 파일. 롤백 SQL을 주석으로 포함 권장                           |
| `tests/`       | 도메인 단위로 파일 분리. supertest + jest 기반 통합 테스트                           |

---

### 6.4 API 라우트 경로 규칙

모든 API 경로는 `/api/v1` 접두사를 사용한다.

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/todos              ?categoryId=&status=
POST   /api/v1/todos
GET    /api/v1/todos/:id
PUT    /api/v1/todos/:id
DELETE /api/v1/todos/:id
PATCH  /api/v1/todos/:id/done

GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id

PATCH  /api/v1/users/me/settings
```

---

_이 문서는 개발 진행 중 설계 결정이 변경될 경우 버전을 올려 갱신한다._
