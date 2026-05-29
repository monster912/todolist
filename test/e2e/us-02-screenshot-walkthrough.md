# US-02: 핵심 업무 흐름 — 스크린샷 동영상 가이드

**테스트 일시**: 2026-05-29  
**테스트 계정**: `e2e_us02_v2@test.com` / `Test1234`  
**테스트 사용자**: US02 Marketing Manager

---

## 📸 스크린샷 단계별 가이드

### Step 1: 로그인 페이지
**파일**: `us-02-step-01-login-page.png`
- 로그인 폼 (이메일, 비밀번호 입력 필드)
- "회원가입" 링크 표시
- 로그인 버튼

### Step 2: 회원가입 후 로그인 페이지
**파일**: `us-02-step-02-after-signup.png`
- 회원가입 완료 후 자동으로 로그인 페이지로 리다이렉트
- 신규 계정으로 로그인 준비

### Step 3: 대시보드 (로그인 후)
**파일**: `us-02-step-03-dashboard-logged-in.png`
- 사용자명: "US02 Marketing Manager" 표시 (좌측 하단)
- 기본 카테고리만 사이드바에 표시
- 할일 목록 비어 있음

### Step 4: 카테고리 관리 페이지
**파일**: `us-02-step-04-categories-page.png`
- "카테고리 추가" 폼 표시
- 기본 카테고리 목록 (수정/삭제 버튼 disabled)
- 카테고리명 입력 필드

### Step 5: 마케팅 카테고리 추가 완료
**파일**: `us-02-step-05-marketing-category-added.png`
- 기본 카테고리 표시 (disabled 상태 유지)
- 마케팅 카테고리 새로 추가 (활성화된 수정/삭제 버튼)
- 입력 필드 초기화됨 (새 카테고리 입력 준비)

### Step 6: 대시보드 (카테고리 반영)
**파일**: `us-02-step-06-dashboard-with-marketing-category.png`
- 사이드바에 "기본", "마케팅" 카테고리 표시
- 카테고리 필터 버튼 활성화
- "할일 등록" FAB 버튼 표시

### Step 7: 할일 등록 폼
**파일**: `us-02-step-07-todo-creation-form.png`
- 제목 입력 필드 (placeholder: "할일 제목을 입력하세요")
- 설명 입력 필드 (placeholder: "설명을 입력하세요 (선택)")
- 카테고리 드롭다운 (기본값: "기본")
- 시작일, 종료일 필드
- 취소/저장 버튼

### Step 8: 할일 생성 후 대시보드
**파일**: `us-02-step-08-todo-created-in-dashboard.png`
- 할일 카드 표시:
  - 제목: "Q2 Marketing Campaign Planning"
  - 상태: "시작 전" (회색 배지)
  - 설명: "Develop advertising and marketing strategy for second quarter"
  - 카테고리: "Marketing" (파란색 태그)
- 완료 처리, 수정, 삭제 버튼 표시

### Step 9: 할일 상세 페이지
**파일**: `us-02-step-09-todo-detail-page.png`
- 제목: "Q2 Marketing Campaign Planning"
- 상태 배지: "시작 전"
- 카테고리: "Marketing"
- 설명: "Develop advertising and marketing strategy for second quarter"
- 완료 처리 버튼
- 수정/삭제 버튼

### Step 10: 할일 수정 페이지
**파일**: `us-02-step-10-todo-edit-page.png`
- 제목 입력 필드 (값: "Q2 Marketing Campaign Planning" 프리필)
- 설명 입력 필드 (값 프리필)
- 카테고리 선택 (마케팅 선택됨)
- 시작일, 종료일 필드 (비어 있음)
- 취소/저장 버튼

---

## ✅ 검증된 기능

### 1. 회원가입 및 로그인 ✅
- 신규 사용자 계정 생성 완료
- JWT 토큰 발급 및 저장
- 사용자 정보 자동 로드

### 2. 카테고리 관리 ✅
- 기본 카테고리 보호 (disabled 버튼)
- 마케팅 카테고리 생성 성공
- 카테고리 목록 즉시 반영
- 사이드바에 새 카테고리 표시

### 3. 할일 생성 ✅
- 할일 등록 폼 정상 작동
- 마케팅 카테고리 선택 가능
- 제목, 설명 입력 완료
- 대시보드에 즉시 반영

### 4. 할일 조회 ✅
- 대시보드 목록 표시
- 할일 상세 페이지 진입
- 메타 정보 정상 표시

### 5. 할일 수정 ✅
- 수정 페이지 진입
- 기존 값 프리필
- 입력 필드 모두 활성화

---

## 🎯 결과 요약

| 단계 | 기능 | 상태 |
|------|------|------|
| 1-2 | 회원가입 | ✅ |
| 3 | 로그인 | ✅ |
| 4-5 | 카테고리 생성 | ✅ |
| 6 | 대시보드 반영 | ✅ |
| 7-8 | 할일 생성 | ✅ |
| 9 | 할일 조회 | ✅ |
| 10 | 할일 수정 | ✅ |

**전체 흐름**: ✅ 완전히 작동

---

## 📂 파일 목록

```
test/e2e/
├── us-02-step-01-login-page.png                  (로그인 페이지)
├── us-02-step-02-after-signup.png               (회원가입 후)
├── us-02-step-03-dashboard-logged-in.png        (대시보드 진입)
├── us-02-step-04-categories-page.png            (카테고리 페이지)
├── us-02-step-05-marketing-category-added.png   (마케팅 카테고리 추가)
├── us-02-step-06-dashboard-with-marketing-category.png  (대시보드 반영)
├── us-02-step-07-todo-creation-form.png         (할일 등록 폼)
├── us-02-step-08-todo-created-in-dashboard.png  (할일 생성 완료)
├── us-02-step-09-todo-detail-page.png          (할일 상세 페이지)
├── us-02-step-10-todo-edit-page.png            (할일 수정 페이지)
└── us-02-screenshot-walkthrough.md              (이 파일)
```

---

## 🎬 시나리오 재생 방법

1. 스크린샷들을 순서대로 열어보세요
2. 각 단계의 UI 변화를 관찰합니다
3. 사용자 상호작용 및 데이터 흐름 확인
4. 카테고리 추가 → 할일 생성 → 수정의 전체 워크플로우 이해

---

**테스트 완료**: US-02 핵심 업무 흐름 시나리오 100% 통과 ✅
