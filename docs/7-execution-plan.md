# 실행계획 - Todo List

| 항목 | 내용 |
|:---|:---|
| 버전 | 1.0.0 |
| 작성일 | 2026-05-28 |
| 작성자 | ochlo |
| 참조 문서 | `2-PRD.md` v2.0.1 · `4-project-structure.md` v1.0.0 · `6-erd.md` v1.1 |

---

## 전체 Task 구성

```
[DB]          [Backend]           [Frontend]
DB-01         BE-01               FE-01
DB-02 ──►     BE-02 ──►           FE-02
DB-03         BE-03               FE-03
              BE-04               FE-04
              BE-05               FE-05
              BE-06               FE-06
              BE-07               FE-07
              BE-08               FE-08
              BE-09               FE-09
              BE-10               FE-10
                                  FE-11
                                  FE-12
                                  FE-13
                                  FE-14
                                  FE-15
                                  FE-16
```

| 영역 | Task 수 | Must Have | Should Have |
|:---|:---|:---|:---|
| Database | 3 | DB-01~03 | — |
| Backend | 10 | BE-01~08, BE-10 | BE-09 |
| Frontend | 16 | FE-01~15 | FE-16 |
| **합계** | **29** | **27** | **2** |

---

## 1. Database

### DB-01 · PostgreSQL 환경 설정

**목표**: 개발 환경에서 PostgreSQL 17 인스턴스를 준비하고 애플리케이션용 데이터베이스와 유저를 생성한다.

**완료 조건**
- [x] PostgreSQL 17 서비스가 로컬에서 정상 실행됨
- [x] `todolist` 데이터베이스 생성 완료
- [x] 전용 DB 유저 생성 및 권한 부여 완료
- [x] `psql -U <user> -d todolist` 접속 성공 확인

**의존성**
- 없음 (시작점)

---

### DB-02 · 마이그레이션 파일 작성

**목표**: 테이블 생성을 단계별 SQL 파일로 분리하여 `backend/migrations/`에 저장한다.

**완료 조건**
- [x] `001_create_users.sql` — `theme_type`, `locale_type` Enum + `user` 테이블 + `updated_at` 트리거
- [x] `002_create_categories.sql` — `category` 테이블 + `user_id` 인덱스 + 기본 카테고리 자동 생성 트리거
- [x] `003_create_todos.sql` — `todo` 테이블 + 인덱스 7개
- [x] 각 파일 상단에 롤백 SQL(`DROP`) 주석 포함
- [x] `database/schema.sql`과 DDL 내용 일치 확인

**의존성**
- [x] DB-01 완료

---

### DB-03 · 스키마 적용 및 검증

**목표**: 마이그레이션 파일을 순서대로 실행하고 스키마가 ERD와 일치하는지 검증한다.

**완료 조건**
- [x] `psql -f 001_create_users.sql` 오류 없이 실행
- [x] `psql -f 002_create_categories.sql` 오류 없이 실행
- [x] `psql -f 003_create_todos.sql` 오류 없이 실행
- [x] `\d user`, `\d category`, `\d todo` 로 컬럼·제약 조건 일치 확인
- [x] 테스트 사용자 INSERT 후 기본 카테고리 자동 생성 트리거 동작 확인
- [x] `updated_at` 트리거: UPDATE 후 값 갱신 확인

**의존성**
- [x] DB-02 완료

---

## 2. Backend

### BE-01 · 프로젝트 초기화

**목표**: `backend/` 디렉토리를 생성하고 Node.js + Express 프로젝트 기반을 구성한다.

**완료 조건**
- [x] `backend/package.json` 생성 (`express`, `pg`, `bcrypt`, `jsonwebtoken`, `cors`, `dotenv` 의존성 포함)
- [x] `devDependencies`: `jest`, `supertest`, `eslint`, `nodemon`
- [x] `backend/.env.example` 작성 (PORT, JWT_SECRET, JWT_EXPIRES_IN, DB_*, BCRYPT_SALT_ROUNDS, CORS_ORIGIN)
- [x] `backend/.env` 로컬 값 설정 (`.gitignore` 확인)
- [x] `backend/src/app.js` — Express 앱 기본 구성 (json 파서, cors, 라우터 마운트 placeholder)
- [x] `backend/server.js` — `app.js` import 후 `listen(PORT)`
- [x] `node server.js` 실행 시 `PORT` 포트에서 서버 기동 확인

**의존성**
- 없음

---

### BE-02 · DB 연결 풀 설정

**목표**: `pg.Pool` 인스턴스를 생성하고 모든 쿼리 계층에서 공유한다.

**완료 조건**
- [x] `backend/src/db/pool.js` 작성 — 환경변수 기반 Pool 설정 (max, idleTimeout, connectionTimeout)
- [x] `pool.query('SELECT 1')` 성공 확인 (서버 기동 시 로그)
- [x] pool이 `db/` 계층 외부로 직접 노출되지 않음

**의존성**
- [x] BE-01 완료
- [x] DB-03 완료

---

### BE-03 · 유틸 함수 구현

**목표**: 전 계층에서 공유하는 순수 유틸 함수를 `utils/`에 구현한다.

**완료 조건**
- [x] `jwtUtils.js` — `signToken({ userId, email })`, `verifyToken(token)` 구현
- [x] `statusUtils.js` — `computeTodoStatus(todo, now)` 구현 (4-state: NOT_STARTED/IN_PROGRESS/DONE/OVERDUE, BR-06 포함)
- [x] `errorUtils.js` — `createError(code, message, statusCode)` 팩토리 구현
- [x] `responseUtils.js` — `sendSuccess(res, data, status)`, `sendError(res, err)` 구현
- [x] `statusUtils` 단위 테스트: 5개 시나리오 (날짜 없음, 시작 전, 진행 중, 기간 초과, 완료) 모두 통과

**의존성**
- [x] BE-01 완료

---

### BE-04 · 인증 미들웨어 구현

**목표**: JWT 검증 미들웨어와 입력값 유효성 검사 미들웨어를 구현한다.

**완료 조건**
- [x] `authenticate.js` — `Authorization: Bearer <token>` 파싱 → `req.user = { userId, email }` 주입
- [x] 토큰 없음 → 401 `UNAUTHORIZED`
- [x] 토큰 만료/변조 → 401 `UNAUTHORIZED`
- [x] `validateAuth.js` — 회원가입: email 형식, password(8자+영문+숫자), name(1~50자) 검증
- [x] `validateTodo.js` — title(1~200자), end_date >= start_date 검증
- [x] `validateCategory.js` — name(1~50자) 검증
- [x] 유효성 실패 시 400 `VALIDATION_ERROR` + 구체적 메시지 반환

**의존성**
- [x] BE-03 완료

---

### BE-05 · 인증 API 구현 (UC-01, UC-02, UC-03)

**목표**: 회원가입, 로그인, 내 정보 조회 API를 구현한다.

**완료 조건**
- [x] `userQueries.js` — `findByEmail`, `findById`, `insertUser` 구현 (파라미터화 쿼리)
- [x] `authController.register` — bcrypt 해싱, 이메일 중복 시 409 `DUPLICATE_EMAIL`, 성공 시 201 + `{ data: user }` (password 제외)
- [x] `authController.login` — bcrypt.compare, 불일치 시 401 `INVALID_CREDENTIALS`, 성공 시 JWT + `{ theme, locale }` 포함 응답
- [x] `authController.getMe` — 인증 필요, 본인 정보 반환
- [x] `POST /api/v1/auth/register` 라우트 연결
- [x] `POST /api/v1/auth/login` 라우트 연결
- [x] `GET /api/v1/auth/me` 라우트 연결 (authenticate 미들웨어 적용)

**의존성**
- [x] BE-02 완료
- [x] BE-04 완료

---

### BE-06 · 카테고리 API 구현 (UC-06, UC-07, UC-08, UC-09)

**목표**: 카테고리 CRUD API를 구현한다. 기본 카테고리 보호 및 삭제 시 할일 이관 포함.

**완료 조건**
- [x] `categoryQueries.js` — `findAllByUserId`, `findByIdAndUserId`, `insertCategory`, `updateCategory`, `deleteCategory`, `reassignTodosToDefault` 구현
- [x] `categoryController.getAll` — 본인 카테고리 전체 반환
- [x] `categoryController.create` — name 중복(동일 user) 시 409 `DUPLICATE_CATEGORY`
- [x] `categoryController.update` — `is_default=true` 수정 시 400 `VALIDATION_ERROR`
- [x] `categoryController.remove` — `is_default=true` 삭제 시 400, 일반 카테고리 삭제 시 트랜잭션으로 할일 기본 카테고리 이관 후 삭제
- [x] 타인 카테고리 수정/삭제 시 403 `FORBIDDEN`
- [x] 전체 4개 라우트 연결 (authenticate 미들웨어 적용)

**의존성**
- [x] BE-05 완료

---

### BE-07 · 할일 API 구현 (UC-10 ~ UC-15)

**목표**: 할일 CRUD + 상태 필터 + status 파생값 API를 구현한다.

**완료 조건**
- [x] `todoQueries.js` — `findAllByUserId(userId, { categoryId })`, `findByIdAndUserId`, `insertTodo`, `updateTodo`, `deleteTodo` 구현
- [x] `todoController.getAll` — 필터(categoryId, status) 적용, 각 항목에 `computeTodoStatus` 적용하여 반환
- [x] `todoController.getOne` — 타인 접근 시 403
- [x] `todoController.create` — category_id 미지정 시 기본 카테고리 자동 적용
- [x] `todoController.update` — 날짜 유효성 재검증, 타인 접근 시 403
- [x] `todoController.toggleDone` — `PATCH /:id/done` — is_done = true 설정
- [x] `todoController.remove` — 타인 접근 시 403
- [x] status 필터: 목록 조회 후 애플리케이션 레벨에서 필터링 (N+1 없이)
- [x] 전체 6개 라우트 연결 (authenticate 미들웨어 적용)

**의존성**
- [x] BE-06 완료

---

### BE-08 · 사용자 설정 API 구현 (UC-16, UC-17)

**목표**: 테마 및 언어 설정을 User 테이블에 저장하는 API를 구현한다.

**완료 조건**
- [x] `userQueries.js` — `updateSettings(userId, { theme, locale })` 추가
- [x] `userController.updateSettings` — theme(`light|dark`), locale(`ko|en`) 유효성 검증, 저장 후 업데이트된 user 반환
- [x] `PATCH /api/v1/users/me/settings` 라우트 연결 (authenticate 미들웨어 적용)
- [x] 잘못된 theme/locale 값 시 400 `VALIDATION_ERROR`

**의존성**
- [x] BE-05 완료

---

### BE-09 · 회원 정보 수정 / 탈퇴 API 구현 (UC-04, UC-05) `Should Have`

**목표**: 이름·비밀번호 수정 및 회원 탈퇴 API를 구현한다.

**완료 조건**
- [x] `userQueries.js` — `updateUser(userId, data)`, `deleteUser(userId)` 추가
- [x] `authController.updateMe` — 현재 비밀번호 확인 후 이름/비밀번호 변경
- [x] `authController.deleteMe` — 비밀번호 재확인 후 계정 삭제 (CASCADE로 카테고리·할일 자동 삭제)
- [x] `PUT /api/v1/auth/me` 및 `DELETE /api/v1/auth/me` 라우트 연결
- [x] 현재 비밀번호 불일치 시 401 `INVALID_CREDENTIALS`

**의존성**
- [x] BE-05 완료

---

### BE-10 · 전역 에러 핸들러 및 서버 완성

**목표**: `app.js`에 전역 에러 핸들러를 등록하고 서버를 완성한다.

**완료 조건**
- [x] 전역 에러 핸들러 — `err.statusCode` 유무에 따라 알려진/알 수 없는 에러 분기
- [x] 500 에러 응답에 스택 트레이스 미포함 확인 (`NODE_ENV=production`)
- [x] 404 핸들러 — 정의되지 않은 경로 요청 시 404 응답
- [x] CORS 설정 — `process.env.CORS_ORIGIN` 기반, 와일드카드 미사용
- [x] `backend/.eslintrc.js` 설정 및 `npm run lint` 오류 없음
- [x] `npm test` — auth/todo/category 통합 테스트 (Tier 1 항목) 모두 통과
  - [x] JWT 미들웨어: 유효/만료/없음 3케이스
  - [x] 소유권: 타인 리소스 접근 403 확인
  - [x] 카테고리 삭제 → 할일 이관 로직

**의존성**
- [x] BE-07 완료
- [x] BE-08 완료

---

## 3. Frontend

### FE-01 · Vite + React 19 + TypeScript 프로젝트 초기화

**목표**: `frontend/` 디렉토리에 Vite 기반 React 프로젝트를 생성하고 기본 패키지를 설치한다.

**완료 조건**
- [x] `npm create vite@latest frontend -- --template react-ts` 실행
- [x] 의존성 설치: `react-router-dom`, `zustand`, `@tanstack/react-query`, `axios`, `react-i18next`, `i18next`
- [x] `frontend/.env.example` 작성 (`VITE_API_BASE_URL`, `VITE_DEFAULT_LOCALE`, `VITE_DEFAULT_THEME`)
- [x] `frontend/.env` 로컬 값 설정
- [x] `tsconfig.json` — `strict: true`, `paths` alias (`@/*`) 설정
- [x] `vite.config.ts` — `@` alias 등록
- [x] `npm run dev` 정상 기동 확인

**의존성**
- 없음

---

### FE-02 · TypeScript 타입 정의

**목표**: 프론트엔드 전체에서 사용할 도메인·API 타입을 정의한다.

**완료 조건**
- [x] `types/todo.types.ts` — `Todo`, `TodoStatus`, `CreateTodoInput`, `UpdateTodoInput`
- [x] `types/category.types.ts` — `Category`, `CreateCategoryInput`, `UpdateCategoryInput`
- [x] `types/user.types.ts` — `User`(`id, email, name, theme, locale`), `AuthUser`
- [x] `types/api.types.ts` — `ApiResponse<T>`, `ApiError`, `PaginatedResponse<T>`
- [x] `any` 타입 미사용

**의존성**
- [x] FE-01 완료

---

### FE-03 · axios 클라이언트 설정

**목표**: 토큰 자동 주입 및 401 자동 처리가 포함된 axios 인스턴스를 구성한다.

**완료 조건**
- [x] `api/client.ts` — `baseURL: import.meta.env.VITE_API_BASE_URL` 설정
- [x] 요청 인터셉터 — `authStore`에서 토큰 꺼내 `Authorization: Bearer` 헤더 주입
- [x] 응답 인터셉터 — 401 수신 시 `authStore.clearAuth()` 호출 후 `/login`으로 리다이렉트
- [x] 에러 응답 → `ApiError` 형태로 변환하여 상위로 throw

**의존성**
- [x] FE-02 완료
- [x] FE-05 완료 (authStore 토큰 접근 필요)

---

### FE-04 · API 함수 구현

**목표**: 백엔드 엔드포인트에 대응하는 API 호출 함수를 도메인별로 작성한다.

**완료 조건**
- [x] `api/authApi.ts` — `register`, `login`, `getMe`
- [x] `api/todoApi.ts` — `getTodos({ categoryId?, status? })`, `getTodo(id)`, `createTodo`, `updateTodo`, `deleteTodo`, `toggleDone(id)`
- [x] `api/categoryApi.ts` — `getCategories`, `createCategory`, `updateCategory(id)`, `deleteCategory(id)`
- [x] `api/userApi.ts` — `updateSettings({ theme?, locale? })`
- [x] 모든 함수에서 `client.ts`의 axios 인스턴스만 사용 (직접 axios import 금지)
- [x] 반환 타입 명시 (`Promise<ApiResponse<T>>`)

**의존성**
- [x] FE-03 완료

---

### FE-05 · Zustand 스토어 구현

**목표**: 인증 상태와 UI 전역 상태를 Zustand 스토어로 구현한다.

**완료 조건**
- [x] `stores/authStore.ts` — `token`, `user(AuthUser)`, `setAuth(token, user)`, `clearAuth()`
  - [x] `token` → `localStorage`에 persist
  - [x] 페이지 새로고침 시 localStorage에서 토큰 복원
- [x] `stores/uiStore.ts` — `selectedCategoryId`, `statusFilter`, `setSelectedCategory`, `setStatusFilter`
- [x] `any` 타입 미사용, 액션명 N-05 컨벤션 준수

**의존성**
- [x] FE-02 완료

---

### FE-06 · i18n 설정 및 번역 파일 작성

**목표**: `react-i18next`를 초기화하고 한국어/영어 번역 파일을 작성한다.

**완료 조건**
- [x] `i18n.ts` — `i18next` 초기화, 언어 결정 우선순위: 1) `authStore.user.locale` → 2) `navigator.language` → 3) `VITE_DEFAULT_LOCALE`
- [x] `locales/ko/translation.json` — 전체 UI 키: 버튼, 레이블, 에러 메시지, status 텍스트
- [x] `locales/en/translation.json` — 동일 키 구조, 영문 번역
- [x] `App.tsx`에서 `i18n.ts` import 및 초기화
- [x] `useTranslation` 훅으로 `t('key')` 정상 동작 확인

**의존성**
- [x] FE-05 완료

---

### FE-07 · React Router 설정 및 PrivateRoute

**목표**: 라우트 구조와 인증 보호 라우트를 구성한다.

**완료 조건**
- [x] `router/index.tsx` — 8개 화면 라우트 정의 (S-01 ~ S-08)
- [x] `PrivateRoute` 컴포넌트 — 미인증 시 `/login`으로 리다이렉트
- [x] 공개 라우트: `/login`, `/register`
- [x] 보호 라우트: `/`, `/todos/new`, `/todos/:id/edit`, `/todos/:id`, `/categories`, `/settings`
- [x] `App.tsx` — `QueryClientProvider` + `RouterProvider` 래핑

**의존성**
- [x] FE-05 완료

---

### FE-08 · 공통 UI 컴포넌트

**목표**: 여러 페이지에서 재사용되는 기본 UI 컴포넌트를 구현한다.

**완료 조건**
- [x] `components/common/Button.tsx` — variant(primary/secondary/danger), disabled, loading 상태
- [x] `components/common/Input.tsx` — label, error 메시지, controlled 입력
- [x] `components/common/Modal.tsx` — 열림/닫힘 제어, 외부 클릭 닫기
- [x] `components/common/LoadingSpinner.tsx` — 로딩 인디케이터
- [x] 모든 컴포넌트 Props 타입 정의 (`컴포넌트명 + Props`)
- [x] 다크모드 대응 CSS 적용 (`data-theme` 기반 CSS 변수)

**의존성**
- [x] FE-01 완료

---

### FE-09 · 인증 화면 구현 (S-01, S-02)

**목표**: 로그인 및 회원가입 페이지를 구현한다.

**완료 조건**
- [x] `pages/LoginPage.tsx` — email/password 폼, 제출 시 `authApi.login` 호출, 성공 시 `authStore.setAuth` + `/` 리다이렉트, 실패 시 에러 메시지 표시
- [x] `pages/RegisterPage.tsx` — email/password/name 폼, 성공 시 로그인 페이지 이동
- [x] 로그인 응답의 `theme`, `locale` → `authStore.user`에 저장 + 즉시 i18n/테마 적용
- [x] 클라이언트 사이드 유효성 검사 (제출 전)
- [x] 이미 로그인된 사용자가 `/login` 접근 시 `/`로 리다이렉트

**의존성**
- [x] FE-04 완료
- [x] FE-06 완료
- [x] FE-07 완료
- [x] FE-08 완료

---

### FE-10 · TanStack Query 훅 구현

**목표**: 서버 상태 관리를 위한 TanStack Query 커스텀 훅을 작성한다.

**완료 조건**
- [x] `hooks/useTodos.ts` — `useQuery(['todos', filters])`, 필터 변경 시 자동 재조회
- [x] `hooks/useTodo.ts` — `useQuery(['todos', id])`
- [x] `hooks/useTodoMutations.ts` — `useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`, `useToggleTodoDone` — 성공 시 `['todos']` 캐시 무효화
- [x] `hooks/useCategories.ts` — `useQuery(['categories'])`
- [x] `hooks/useCategoryMutations.ts` — `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory` — 성공 시 캐시 무효화
- [x] Query key 구조 N-04 컨벤션 준수

**의존성**
- [x] FE-04 완료

---

### FE-11 · 할일 도메인 컴포넌트

**목표**: 할일 목록·카드·폼·상태 배지 컴포넌트를 구현한다.

**완료 조건**
- [x] `components/todo/StatusBadge.tsx` — 4가지 status 색상 구분 배지 (NOT_STARTED/IN_PROGRESS/DONE/OVERDUE)
- [x] `components/todo/TodoCard.tsx` — 제목, 상태 배지, 카테고리, 날짜 표시, 완료 토글 버튼, 수정/삭제 버튼
- [x] `components/todo/TodoList.tsx` — TodoCard 목록 렌더링, 빈 상태 메시지
- [x] `components/todo/TodoForm.tsx` — title, description, category select, start_date, end_date 입력, 날짜 순서 유효성 검사

**의존성**
- [x] FE-08 완료
- [x] FE-10 완료

---

### FE-12 · 카테고리 도메인 컴포넌트

**목표**: 카테고리 필터와 폼 컴포넌트를 구현한다.

**완료 조건**
- [x] `components/category/CategoryFilter.tsx` — 카테고리 탭/버튼 목록, 선택된 카테고리 `uiStore`에 저장
- [x] `components/category/CategoryForm.tsx` — name 입력 폼, 생성/수정 모드 분기, 기본 카테고리 수정 비활성화

**의존성**
- [x] FE-08 완료
- [x] FE-10 완료

---

### FE-13 · 대시보드 페이지 (S-03)

**목표**: 할일 목록 조회, 카테고리 필터, 상태 필터가 통합된 메인 화면을 구현한다.

**완료 조건**
- [x] `pages/DashboardPage.tsx` — 카테고리 사이드바 + 상태 필터 탭 + TodoList 조합
- [x] **목록/달력 뷰 토글 버튼** — `uiStore.viewMode` 기반 조건부 렌더링
  - [x] 목록 뷰: 기존 상태 필터 탭 + TodoList
  - [x] 달력 뷰: CalendarView (월간/주간/타임라인 탭)
- [x] 카테고리 선택/상태 필터 변경 시 `useTodos` 재조회 (자동)
- [x] 할일 완료 토글 — `useToggleTodoDone` 호출 후 목록 갱신
- [x] 할일 삭제 — Modal 확인 후 `useDeleteTodo` 호출
- [x] 반응형: `>= 1024px` 사이드바 + 메인 2단, `< 1024px` 단일 컬럼
- [x] **달력 컴포넌트**:
  - [x] `components/calendar/CalendarView.tsx` — 월간/주간/타임라인 탭 전환, 이전/다음 네비게이션
  - [x] `components/calendar/MonthlyView.tsx` — 7열 그리드, 할일 칩 표시, 균등 셀 높이
  - [x] `components/calendar/WeeklyView.tsx` — 주간 컬럼 뷰, 날짜별 할일 카드
  - [x] `components/calendar/TimelineView.tsx` — Gantt 스타일 타임라인

**의존성**
- [x] FE-11 완료
- [x] FE-12 완료

---

### FE-14 · 할일 등록 / 수정 / 상세 페이지 (S-04, S-05, S-06)

**목표**: 할일 CRUD 화면을 완성한다.

**완료 조건**
- [x] `pages/TodoCreatePage.tsx` — TodoForm으로 신규 생성, 성공 시 `/` 이동
- [x] `pages/TodoEditPage.tsx` — `useTodo(id)`로 기존 데이터 프리필, 수정 후 상세 페이지 이동
- [x] `pages/TodoDetailPage.tsx` — 전체 필드 표시, status 배지, 완료/미완료 토글 버튼, 수정/삭제 버튼
- [x] 타인 할일 접근 시 403 → 홈으로 리다이렉트
- [x] **시간 선택 기능**:
  - [x] `components/todo/TodoForm.tsx` — date 입력을 `datetime-local` 타입으로 변경 (날짜 + 시간 선택)
  - [x] `utils/dateFormat.ts` — `datetimeLocalToISO()` 변환 함수 (로컬 시간 → ISO 8601)
- [x] **시간 형식 개선**:
  - [x] `formatDateRange()` — 읽기 좋은 형식 (예: `05/28 15:00 ~ 05/29 17:00`)
  - [x] TodoCard, TodoDetailPage, TimelineView에 적용
- [x] **완료 처리 원복**:
  - [x] TodoCard 체크박스 — 완료/미완료 토글 가능
  - [x] TodoDetailPage — 완료 시 "미완료로 변경" 버튼 표시
  - [x] `todo.restore` 번역 키 추가 (ko/en)

**의존성**
- [x] FE-13 완료

---

### FE-15 · 카테고리 관리 페이지 (S-07)

**목표**: 카테고리 목록, 생성, 수정, 삭제 화면을 구현한다.

**완료 조건**
- [x] `pages/CategoryPage.tsx` — 카테고리 목록 + 생성 폼 + 수정/삭제 버튼
- [x] 기본 카테고리(`is_default=true`) 수정/삭제 버튼 비활성화 처리
- [x] 삭제 시 Modal 확인 후 실행

**의존성**
- [x] FE-12 완료

---

### FE-16 · 설정 페이지 (S-08) `Should Have`

**목표**: 테마·언어 변경, 이름·비밀번호 수정, 회원 탈퇴 화면을 구현한다.

**완료 조건**
- [x] `pages/SettingsPage.tsx` — 이름 수정, 비밀번호 변경, 다크/라이트 모드 토글, 언어 선택(ko/en), 회원 탈퇴 버튼
- [x] 테마 토글 — `userApi.updateSettings({ theme })` 호출 + `authStore` 업데이트 + `data-theme` 즉시 적용
- [x] 언어 변경 — `userApi.updateSettings({ locale })` 호출 + `i18n.changeLanguage()` 즉시 적용
- [x] 회원 탈퇴 — 비밀번호 재확인 Modal 후 `authController.deleteMe` 호출, 성공 시 `clearAuth` + `/login` 이동

**의존성**
- [x] FE-09 완료
- [x] BE-09 완료

---

## 의존성 전체 그래프

```
DB-01
  └── DB-02
        └── DB-03
              └── BE-02

BE-01
  └── BE-03
        └── BE-04
              └── BE-05
                    ├── BE-06
                    │     └── BE-07
                    │           └── BE-10
                    ├── BE-08
                    │     └── BE-10
                    └── BE-09

FE-01
  └── FE-02
        ├── FE-05
        │     ├── FE-03
        │     │     └── FE-04
        │     ├── FE-06
        │     └── FE-07
        └── FE-08

FE-04 + FE-05 + FE-06 + FE-07 + FE-08
  └── FE-09
        └── (통합 테스트)

FE-04
  └── FE-10
        ├── FE-11
        │     └── FE-13
        │           └── FE-14
        └── FE-12
              ├── FE-13
              └── FE-15
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|:---|:---|:---|:---|
| 1.1.0 | 2026-05-29 | FE-13, FE-14 확장: 달력 뷰(월간/주간/타임라인), 시간 선택, 시간 형식 개선, 완료 원복 기능 추가 | Claude |
| 1.0.0 | 2026-05-28 | 초기 작성 — 29개 Task (DB 3, BE 10, FE 16) | ochlo |
