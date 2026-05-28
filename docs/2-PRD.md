# PRD (Product Requirements Document) - Todo List

| 항목 | 내용 |
|------|------|
| 버전 | 2.0.0 |
| 상태 | 초안 |
| 작성일 | 2026-05-27 |
| 최종 수정일 | 2026-05-27 |
| 작성자 | ochlo |
| 참조 문서 | `docs/1-domain-definition.md` v1.1.0 |

---

## 1. 제품 개요

### 목적

인증된 사용자가 카테고리와 일정(시작일/종료일) 기반으로 개인 할일을 체계적으로 관리할 수 있는 웹 애플리케이션을 제공한다.

### 비즈니스 목표

| # | 목표 | 측정 지표 |
|---|------|----------|
| G-01 | 동시 접속 1,000명 처리 | 서버 응답 시간 500ms 이내 유지 |
| G-02 | 핵심 기능 2일 내 완성 | MVP 기능 15개 UC 구현 완료 |
| G-03 | 안정적인 개인 데이터 보호 | 타 사용자 데이터 접근 0건 |

### 범위

- **In Scope**: 회원 인증, 카테고리 관리, 할일 CRUD, 상태 필터링, 반응형 웹 UI, 다국어(i18n), 다크/라이트 모드 (사용자 설정 저장)
- **Out of Scope**: 소셜 로그인, 알림/푸시, 팀 협업, 파일 첨부, 접근성(WCAG), 네이티브 모바일 앱

---

## 2. 목표 사용자

| 세그먼트 | 설명 | 핵심 니즈 |
|----------|------|----------|
| 학생 | 과제·시험 일정 관리가 필요한 중고생/대학생 | 시작일~종료일 기반 할일 추적, 기간 초과 항목 식별 |
| 직장인 (20~50대) | 업무 태스크를 카테고리별로 분류·관리하는 직장인 | 카테고리 분리, 진행 상태 한눈에 파악 |

**공통 사용 패턴**
- 개인 디바이스(PC/모바일)에서 빠른 할일 등록 및 확인
- 상태별(시작 전/진행 중/완료/기간 초과) 필터링으로 우선순위 파악

---

## 3. 기능 요구사항

우선순위 기준:
- **Must Have**: 2일 내 반드시 구현. 미완성 시 제품 출시 불가
- **Should Have**: 가능하면 구현. 미완성 시 UX 저하 있으나 출시 가능
- **Nice to Have**: 시간 여유 시 구현. 미구현 시 영향 미미

### 3.1 인증 (Authentication)

| UC | 기능 | 우선순위 | 비즈니스 규칙 | 핵심 요구사항 |
|----|------|----------|--------------|--------------|
| UC-01 | 회원 가입 | Must Have | — | email(고유), password(8자+영문+숫자), name 입력. 성공 시 '기본' 카테고리 자동 생성 |
| UC-02 | 로그인 | Must Have | — | email+password 검증 후 JWT 발급. 실패 시 에러 메시지 |
| UC-03 | 로그아웃 | Must Have | BR-01 | 클라이언트 토큰 삭제. 이후 인증 필요 요청 차단 |
| UC-04 | 회원 정보 수정 | Should Have | BR-01, BR-07 | 이름, 비밀번호 수정 가능. 현재 비밀번호 확인 후 변경 |
| UC-05 | 회원 탈퇴 | Should Have | BR-01, BR-02 | 비밀번호 재확인 후 계정 및 연관 데이터(카테고리, 할일) 전체 삭제 |

### 3.2 카테고리 관리 (Category)

| UC | 기능 | 우선순위 | 비즈니스 규칙 | 핵심 요구사항 |
|----|------|----------|--------------|--------------|
| UC-06 | 카테고리 목록 조회 | Must Have | BR-01, BR-02 | 본인 카테고리 전체 반환. '기본' 카테고리 항상 포함 |
| UC-07 | 카테고리 생성 | Must Have | BR-01, BR-02 | name(1~50자, 사용자 내 중복 불가). 생성 성공 시 목록에 즉시 반영 |
| UC-08 | 카테고리 수정 | Should Have | BR-01, BR-02, BR-04 | '기본' 카테고리(is_default=true) 이름 수정 요청 시 400 반환 |
| UC-09 | 카테고리 삭제 | Should Have | BR-01, BR-02, BR-04 | '기본' 카테고리 삭제 요청 시 400 반환. 삭제 시 소속 할일의 category_id를 '기본' 카테고리로 이관 |

### 3.3 할일 관리 (Todo)

| UC | 기능 | 우선순위 | 비즈니스 규칙 | 핵심 요구사항 |
|----|------|----------|--------------|--------------|
| UC-10 | 할일 등록 | Must Have | BR-01, BR-03, BR-05, BR-06 | title(필수), description(선택), category_id(미지정 시 기본), start_date/end_date(선택). end_date >= start_date 검증 |
| UC-11 | 할일 목록 조회 | Must Have | BR-01, BR-02 | 본인 할일 전체 반환. 상태(status) 파생값 포함. 카테고리별·상태별 필터 지원 |
| UC-12 | 할일 상세 조회 | Must Have | BR-01, BR-02 | 단건 조회. status 파생값 포함. 타인 할일 요청 시 403 반환 |
| UC-13 | 할일 수정 | Must Have | BR-01, BR-02, BR-05 | title, description, category_id, start_date, end_date, is_done 수정 가능. 날짜 유효성 재검증 |
| UC-14 | 할일 완료 처리 | Must Have | BR-01, BR-02 | is_done을 true로 변경하는 단순 PATCH. status는 즉시 DONE으로 파생 |
| UC-15 | 할일 삭제 | Must Have | BR-01, BR-02 | 단건 삭제. 타인 할일 요청 시 403 반환 |

### 3.4 테마 및 언어 설정 (v2 신규)

| UC | 기능 | 우선순위 | 핵심 요구사항 |
|----|------|----------|--------------|
| UC-16 | 테마 모드 변경 | Must Have | Dark / Light 선택. 선택값을 User 테이블의 `theme` 컬럼에 저장. 다음 로그인 시 저장된 테마로 자동 적용 |
| UC-17 | 언어 변경 | Must Have | 한국어(ko) / 영어(en) 선택. 선택값을 User 테이블의 `locale` 컬럼에 저장. 다음 로그인 시 저장된 언어로 자동 적용 |

**User 엔티티 추가 속성 (v2)**

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| theme | Enum | Y | `light` | 테마 모드. `light` \| `dark` |
| locale | Enum | Y | `ko` | UI 언어. `ko` \| `en` |

> 로그인 응답에 `theme`, `locale` 포함하여 클라이언트가 초기 렌더링 시 즉시 적용 가능하도록 한다.

---

### 3.5 상태 파생 로직 (공통)

모든 할일 응답(목록/상세)에 `status` 필드를 포함하며, 서버에서 조회 시점에 실시간 계산한다.

| 조건 | status |
|------|--------|
| is_done = true | DONE |
| is_done = false AND (start_date 없거나 end_date 없음) | NOT_STARTED |
| is_done = false AND today < start_date | NOT_STARTED |
| is_done = false AND start_date <= today <= end_date | IN_PROGRESS |
| is_done = false AND today > end_date | OVERDUE |

> 경계: today = start_date 또는 today = end_date 모두 IN_PROGRESS

### 3.6 필터 조건 상세

| 필터 파라미터 | 값 | 동작 |
|--------------|-----|------|
| `categoryId` | UUID | 해당 카테고리 소속 할일만 반환 |
| `status` | NOT_STARTED / IN_PROGRESS / DONE / OVERDUE | 해당 파생 상태 할일만 반환 |
| 복합 필터 | categoryId + status | AND 조건으로 교차 필터링 |

---

## 4. 비기능 요구사항

### 4.1 성능

| 항목 | 기준 |
|------|------|
| 동시 접속 | 1,000명 동시 처리 |
| API 응답 시간 | 95th percentile 500ms 이내 (DB 인덱스 필수: user_id, category_id) |
| DB 쿼리 | N+1 쿼리 금지. 할일 목록 조회는 단일 쿼리로 처리 |

### 4.2 보안

| 항목 | 기준 |
|------|------|
| 인증 방식 | JWT (Access Token). 만료 시간 명시 |
| 비밀번호 저장 | bcrypt 해싱 필수 (평문 저장 금지) |
| 데이터 격리 | 모든 API에서 user_id 기반 소유권 검증. 타인 데이터 접근 시 403 반환 |
| 입력값 검증 | 모든 요청 파라미터 서버사이드 유효성 검증 필수 |
| SQL Injection | pg 라이브러리 파라미터화 쿼리($1, $2...) 사용 필수 |

### 4.3 다국어 (i18n)

| 항목 | 기준 |
|------|------|
| 지원 언어 | 한국어(`ko`), 영어(`en`) |
| i18n 라이브러리 | `react-i18next` |
| 번역 파일 위치 | `src/locales/ko.json`, `src/locales/en.json` |
| 언어 결정 우선순위 | 1) 로그인 사용자의 `locale` 저장값 → 2) 비로그인 시 브라우저 언어 감지 |
| 번역 범위 | UI 레이블, 버튼, 에러 메시지, 상태 텍스트 전체 |

### 4.4 다크/라이트 모드

| 항목 | 기준 |
|------|------|
| 구현 방식 | CSS 변수 + `data-theme` 속성 또는 Tailwind `dark:` 클래스 |
| 테마 결정 우선순위 | 1) 로그인 사용자의 `theme` 저장값 → 2) 비로그인 시 시스템 설정(`prefers-color-scheme`) |
| 저장 위치 | User 테이블 `theme` 컬럼 (서버 영속, 로그인 응답에 포함) |
| 즉시 적용 | 토글 시 API 호출하여 서버 저장 + 클라이언트 즉시 반영 (로딩 없이) |

### 4.5 반응형 UI

| 브레이크포인트 | 대상 기기 | 레이아웃 전략 |
|--------------|----------|--------------|
| >= 1024px | 데스크탑/태블릿 가로 | 사이드바 + 메인 2단 구성 |
| < 1024px | 태블릿 세로/모바일 | 단일 컬럼, 하단 네비게이션 또는 햄버거 메뉴 |

- 웹 우선(Desktop-first) 설계
- 접근성(WCAG) 미적용

### 4.6 가용성 및 운영

| 항목 | 기준 |
|------|------|
| 에러 응답 형식 | `{ "error": { "code": "...", "message": "..." } }` 통일 |
| HTTP 상태 코드 | 200/201/204/400/401/403/404/409/500 표준 사용 |
| 환경 변수 관리 | DB 접속 정보, JWT_SECRET 등 .env 파일로 분리 |

---

## 5. 기술 스택 및 제약사항

### 5.1 기술 스택

| 레이어 | 기술 | 버전/비고 |
|--------|------|----------|
| Frontend | React | 19 |
| Frontend | TypeScript | 최신 안정 버전 |
| Frontend | React Router | v6 이상. 라우팅 및 보호 라우트(PrivateRoute) |
| Frontend | Zustand | 전역 상태 관리 (인증 토큰, 사용자 정보) |
| Frontend | TanStack Query | 서버 상태 관리, API 캐싱 |
| Frontend | axios | HTTP 클라이언트. 인터셉터로 토큰 주입 및 401 처리 |
| Frontend | react-i18next | 다국어(i18n) 처리. 번역 파일: `src/locales/ko.json`, `en.json` |
| Backend | Node.js + Express | JavaScript (TypeScript 미적용) |
| Backend | pg | PostgreSQL 클라이언트 (Prisma 사용 금지) |
| Database | PostgreSQL | 17 |

### 5.2 명시적 제약사항

| 제약 | 내용 |
|------|------|
| ORM 금지 | Prisma 사용 불가. pg 라이브러리 직접 쿼리 작성 |
| 플랫폼 | 웹 우선. 네이티브 앱 개발 없음 |
| 팀 규모 | 1인 개발. 복잡도 최소화 우선 |
| 접근성 | WCAG 미적용 |

### 5.3 DB 인덱스 필수 항목

```sql
-- 소유권 격리 및 필터링 성능
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_todos_user_category ON todos(user_id, category_id);
```

---

## 6. MVP 범위 및 출시 일정

### 6.1 MVP 기능 범위

**Day 1 (백엔드 중심)**

| 시간 | 작업 | 산출물 |
|------|------|--------|
| 오전 | DB 스키마 설계 및 마이그레이션 | DDL 파일 |
| 오전 | 인증 API (UC-01, UC-02, UC-03) | `/auth/register`, `/auth/login`, `/auth/logout` |
| 오후 | 카테고리 API (UC-06, UC-07, UC-08, UC-09) | `/categories` CRUD |
| 오후 | 할일 API (UC-10~15) | `/todos` CRUD + 필터 |

**Day 2 (프론트엔드 + 통합)**

| 시간 | 작업 | 산출물 |
|------|------|--------|
| 오전 | React 프로젝트 세팅, 인증 화면 구현 | 로그인/회원가입 페이지 |
| 오전 | Zustand 인증 스토어, TanStack Query 훅 세팅 | auth store, API hooks |
| 오후 | 할일 목록/등록/수정/삭제 화면 | 메인 대시보드 |
| 오후 | 상태 필터, 카테고리 관리, 반응형 CSS 적용 | 필터 UI, 카테고리 사이드바 |
| 저녁 | 통합 테스트 및 버그 수정 | 배포 가능 빌드 |

### 6.2 우선순위 요약

| 우선순위 | UC 목록 | 비고 |
|----------|---------|------|
| Must Have (Day 1~2) | UC-01, UC-02, UC-03, UC-06, UC-07, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-17 | 13개. 미완성 시 출시 불가 |
| Should Have (Day 2 여유분) | UC-04, UC-05, UC-08, UC-09 | 4개. 미완성 시 출시 가능 |
| Nice to Have | — | 해당 없음 (1인 2일 제약) |

---

## 7. 화면 목록

| # | 화면명 | URL 경로 | 접근 조건 | 주요 구성 요소 |
|---|--------|----------|----------|--------------|
| S-01 | 로그인 | `/login` | 비인증 | 이메일/비밀번호 입력 폼, 회원가입 링크 |
| S-02 | 회원가입 | `/register` | 비인증 | 이메일/비밀번호/이름 입력 폼 |
| S-03 | 할일 대시보드 | `/` | 인증 필수 | 카테고리 사이드바, 상태 필터 탭, 할일 목록, 빠른 등록 버튼 |
| S-04 | 할일 등록 | `/todos/new` | 인증 필수 | title, description, category, start_date, end_date 입력 폼 |
| S-05 | 할일 수정 | `/todos/:id/edit` | 인증 필수 (본인) | S-04와 동일 폼, 기존 값 프리필 |
| S-06 | 할일 상세 | `/todos/:id` | 인증 필수 (본인) | 할일 전체 정보, status 배지, 완료 처리 버튼, 수정/삭제 버튼 |
| S-07 | 카테고리 관리 | `/categories` | 인증 필수 | 카테고리 목록, 생성 폼, 수정/삭제 버튼 ('기본' 카테고리 수정/삭제 비활성화) |
| S-08 | 회원 정보 수정 | `/settings` | 인증 필수 | 이름 수정 폼, 비밀번호 변경 폼, 다크/라이트 모드 토글, 언어 선택(ko/en), 회원 탈퇴 버튼 |

> 인증되지 않은 사용자가 S-03~S-08 접근 시 `/login`으로 리다이렉트

---

## 8. 제외 범위 (Out of Scope)

| 항목 | 제외 이유 |
|------|----------|
| 소셜 로그인 (Google, Kakao 등) | 2일 개발 일정 초과 |
| 이메일 인증 / 비밀번호 찾기 | 2일 개발 일정 초과 |
| 알림 / 푸시 / 이메일 발송 | 인프라 추가 필요 |
| 파일 첨부 (이미지, 문서) | S3 등 스토리지 연동 필요 |
| 팀/공유 기능 | 멀티 사용자 협업 모델 미포함 |
| 반복 일정 (Recurring Todo) | 도메인 복잡도 증가 |
| 드래그 앤 드롭 정렬 | 개발 공수 대비 우선순위 낮음 |
| 네이티브 모바일 앱 (iOS/Android) | 웹 반응형으로 대체 |
| 접근성 (WCAG) | 명시적 제외 결정 |
| 관리자 페이지 | 1인 서비스, 필요 없음 |

---

## 9. 유효성 검증 규칙 요약

| 필드 | 규칙 | 에러 코드 |
|------|------|----------|
| email | 이메일 형식, DB 중복 불가 | 400 / 409 |
| password | 최소 8자, 영문+숫자 조합 | 400 |
| name | 1~50자 | 400 |
| Category.name | 1~50자, 동일 user_id 내 중복 불가 | 400 / 409 |
| Todo.title | 1~200자 | 400 |
| end_date | start_date 존재 시 end_date >= start_date | 400 |
| 소유권 | 모든 수정/삭제 요청에서 user_id 일치 여부 확인 | 403 |

---

## 10. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0.0 | 2026-05-27 | 최초 작성 | ochlo |
| 2.0.0 | 2026-05-27 | 다국어(i18n) 및 다크/라이트 모드 기능 추가 (UC-16, UC-17), User 엔티티에 theme/locale 컬럼 추가, 기술 스택에 react-i18next 추가, 섹션 4.3~4.4 신설, S-08 화면 업데이트, Out of Scope에서 i18n 제거 | ochlo |
| 2.0.1 | 2026-05-27 | 기술 스택에 React Router, axios 추가 (일관성 검토 반영) | ochlo |
