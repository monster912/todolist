# 스타일 가이드 - Todo List

| 항목 | 내용 |
|------|------|
| 버전 | 1.0.0 |
| 작성일 | 2026-05-28 |
| 작성자 | ochlo |
| 디자인 참조 | X(Twitter) UI 디자인 시스템 |
| 참조 문서 | `docs/2-PRD.md` v2.0.1, `docs/8-wireframes.md` v1.0.0 |

---

## 디자인 철학

X(Twitter)의 UI에서 영감을 받은 **클린 미니멀리즘** 원칙을 적용한다.

- **명확성**: 콘텐츠가 디자인보다 앞에 위치한다. 불필요한 장식을 제거한다.
- **일관성**: 동일한 패턴은 항상 동일하게 표현한다.
- **계층성**: 타이포그래피와 색상으로 정보의 중요도를 구분한다.
- **반응성**: 모든 인터랙션에 즉각적인 시각적 피드백을 제공한다.

---

## 목차

1. [색상 시스템](#1-색상-시스템)
2. [타이포그래피](#2-타이포그래피)
3. [간격 시스템](#3-간격-시스템)
4. [레이아웃](#4-레이아웃)
5. [컴포넌트](#5-컴포넌트)
6. [아이콘](#6-아이콘)
7. [애니메이션 및 전환](#7-애니메이션-및-전환)
8. [CSS 변수 전체 정의](#8-css-변수-전체-정의)

---

## 1. 색상 시스템

### 1.1 기본 팔레트

X(Twitter) UI를 참조하여 높은 대비, 낮은 채도 기반의 팔레트를 사용한다.

| 토큰명 | 라이트 모드 | 다크 모드 | 용도 |
|--------|------------|----------|------|
| `--color-bg` | `#FFFFFF` | `#000000` | 페이지 배경 |
| `--color-bg-secondary` | `#F7F9F9` | `#16181C` | 사이드바, 입력 필드 배경 |
| `--color-bg-tertiary` | `#EFF3F4` | `#1E2328` | 호버 상태, 구분 영역 |
| `--color-surface` | `#FFFFFF` | `#16181C` | 카드, 모달 배경 |
| `--color-border` | `#EFF3F4` | `#2F3336` | 구분선, 카드 테두리 |
| `--color-text-primary` | `#0F1419` | `#E7E9EA` | 본문, 제목 |
| `--color-text-secondary` | `#536471` | `#71767B` | 보조 텍스트, 메타 정보 |
| `--color-text-disabled` | `#9DA3A8` | `#3E4144` | 비활성 텍스트 |
| `--color-accent` | `#1A8CD8` | `#1A8CD8` | 링크, 활성 탭, 포커스 |
| `--color-accent-hover` | `#1677BF` | `#1677BF` | 액센트 호버 |

### 1.2 상태 색상 (Status Badge)

할일 상태를 색상으로 구분한다. 라이트/다크 모드 모두 동일한 색상을 사용하되 배경 투명도로 구분한다.

| 상태 | 텍스트 색상 | 배경 색상 | Hex |
|------|-----------|----------|-----|
| `NOT_STARTED` | `#536471` | `rgba(83,100,113,0.12)` | 회색 계열 |
| `IN_PROGRESS` | `#1A8CD8` | `rgba(26,140,216,0.12)` | 파란색 계열 |
| `DONE` | `#00BA7C` | `rgba(0,186,124,0.12)` | 초록색 계열 |
| `OVERDUE` | `#F4212E` | `rgba(244,33,46,0.12)` | 빨간색 계열 |

### 1.3 인터랙션 색상

| 용도 | 색상 | 비고 |
|------|------|------|
| 위험 작업 (삭제, 탈퇴) | `#F4212E` | 버튼 variant=danger |
| 성공/완료 | `#00BA7C` | 완료 처리 성공 피드백 |
| 경고 | `#FFD400` | 기간 초과 임박 알림 (선택) |
| 포커스 링 | `#1A8CD8` | outline 2px |

---

## 2. 타이포그래피

### 2.1 폰트 패밀리

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, "Noto Sans KR", sans-serif;
```

한국어 지원을 위해 `Noto Sans KR` (Google Fonts)를 fallback으로 포함한다.

### 2.2 폰트 크기 스케일

| 토큰 | 크기 | line-height | 용도 |
|------|------|-------------|------|
| `--text-xs` | `12px` | `1.4` | 타임스탬프, 메타 정보 |
| `--text-sm` | `14px` | `1.5` | 보조 텍스트, 버튼 (small) |
| `--text-base` | `15px` | `1.5` | 본문, 할일 제목 |
| `--text-lg` | `17px` | `1.5` | 섹션 헤더, 강조 텍스트 |
| `--text-xl` | `20px` | `1.3` | 페이지 제목 |
| `--text-2xl` | `24px` | `1.3` | 대형 헤드라인 |

### 2.3 폰트 굵기

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-normal` | `400` | 본문 텍스트 |
| `--font-medium` | `500` | 네비게이션 아이템, 버튼 |
| `--font-semibold` | `600` | 카드 제목, 섹션 헤더 |
| `--font-bold` | `700` | 페이지 제목, 강조 |

### 2.4 타이포그래피 적용 예시

```css
/* 할일 카드 제목 */
.todo-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  line-height: 1.5;
}

/* 메타 정보 (날짜, 카테고리명) */
.todo-meta {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  color: var(--color-text-secondary);
}

/* 페이지 헤더 */
.page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}
```

---

## 3. 간격 시스템

4px 기반 8단계 스케일을 사용한다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--spacing-1` | `4px` | 아이콘과 텍스트 사이, 미세 간격 |
| `--spacing-2` | `8px` | 인라인 요소 간격, 작은 패딩 |
| `--spacing-3` | `12px` | 버튼 내부 패딩 (vertical) |
| `--spacing-4` | `16px` | 카드 내부 패딩, 기본 간격 |
| `--spacing-5` | `20px` | 섹션 간 간격 |
| `--spacing-6` | `24px` | 컴포넌트 간 대간격 |
| `--spacing-8` | `32px` | 페이지 상하 패딩 |
| `--spacing-12` | `48px` | 대형 섹션 분리 |

---

## 4. 레이아웃

### 4.1 브레이크포인트

| 구분 | 기준 | 레이아웃 |
|------|------|----------|
| 데스크탑 | `>= 1024px` | 사이드바(240px) + 메인 영역 |
| 모바일 | `< 1024px` | 단일 컬럼 + 하단 네비게이션 바 |

### 4.2 데스크탑 2단 레이아웃

X(Twitter)의 사이드바 + 메인 구조를 참조한다.

```
┌─────────────────────────────────────────┐
│ HEADER (높이: 53px, sticky)             │
├──────────────┬──────────────────────────┤
│              │                          │
│  SIDEBAR     │  MAIN CONTENT            │
│  (240px)     │  (flex: 1, max 600px)    │
│  fixed       │  border-x 1px            │
│              │                          │
└──────────────┴──────────────────────────┘
```

```css
/* 레이아웃 컨테이너 */
.app-layout {
  display: flex;
  min-height: 100vh;
  max-width: 1280px;
  margin: 0 auto;
}

.sidebar {
  width: 240px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  padding: 0 var(--spacing-4);
}

.main-content {
  flex: 1;
  max-width: 600px;
  border-right: 1px solid var(--color-border);
  min-height: 100vh;
}
```

### 4.3 헤더

```css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 53px;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-4);
  background-color: var(--color-bg);
  /* 반투명 blur 효과 */
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.85); /* 라이트 */
  border-bottom: 1px solid var(--color-border);
}
```

### 4.4 모바일 레이아웃

```css
@media (max-width: 1023px) {
  .sidebar { display: none; }

  .main-content {
    max-width: 100%;
    border: none;
    padding-bottom: 64px; /* 하단 네비게이션 바 높이 확보 */
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    background-color: var(--color-bg);
    border-top: 1px solid var(--color-border);
    z-index: 10;
  }
}
```

---

## 5. 컴포넌트

### 5.1 버튼

X(Twitter)의 버튼 스타일을 참조한다. 모든 버튼은 `border-radius: 9999px` (pill 형태).

#### Primary 버튼 (할일 등록, 저장, 로그인)

```css
.btn-primary {
  background-color: var(--color-text-primary); /* 라이트: #0F1419, 다크: #E7E9EA */
  color: var(--color-bg);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  padding: 10px var(--spacing-6);
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 120px;
  text-align: center;
}

.btn-primary:hover {
  background-color: rgba(15, 20, 25, 0.85); /* 라이트 */
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Secondary 버튼 (취소, 돌아가기)

```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  padding: 10px var(--spacing-6);
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: var(--color-bg-tertiary);
}
```

#### Danger 버튼 (삭제, 회원 탈퇴)

```css
.btn-danger {
  background-color: transparent;
  color: #F4212E;
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  padding: 10px var(--spacing-6);
  border-radius: 9999px;
  border: 1px solid rgba(244, 33, 46, 0.3);
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: rgba(244, 33, 46, 0.1);
}
```

#### Ghost 버튼 (아이콘 버튼, 완료/수정/삭제 인라인)

```css
.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  padding: var(--spacing-2);
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-sm);
  transition: background-color 0.2s, color 0.2s;
}

.btn-ghost:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-accent);
}
```

### 5.2 입력 필드

```css
.input {
  width: 100%;
  background-color: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 12px var(--spacing-4);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
  outline: none;
}

.input::placeholder {
  color: var(--color-text-secondary);
}

.input:focus {
  border-color: var(--color-accent);
  background-color: var(--color-bg);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 에러 상태 */
.input.error {
  border-color: #F4212E;
}

/* 에러 메시지 */
.input-error-msg {
  font-size: var(--text-xs);
  color: #F4212E;
  margin-top: var(--spacing-1);
  padding-left: var(--spacing-1);
}

/* 텍스트에어리어 (할일 설명) */
.textarea {
  resize: vertical;
  min-height: 80px;
  /* input과 동일한 스타일 */
}

/* 검색 입력 — rounded pill 스타일 */
.input-search {
  border-radius: 9999px;
  background-color: var(--color-bg-secondary);
  padding: 10px 44px 10px var(--spacing-4);
}
```

### 5.3 할일 카드 (TodoCard)

X(Twitter)의 트윗 카드 구조를 참조한다.

```css
.todo-card {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.todo-card:hover {
  background-color: var(--color-bg-secondary);
}

/* 완료된 할일 — 텍스트 취소선 */
.todo-card.done .todo-title {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

/* 카드 좌측 — 체크박스 영역 */
.todo-card-left {
  padding-top: 2px;
}

/* 카드 우측 — 콘텐츠 영역 */
.todo-card-right {
  flex: 1;
  min-width: 0;
}

/* 카드 상단 행: 제목 + 상태 배지 */
.todo-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-1);
}

/* 카드 하단 행: 메타(카테고리, 날짜) + 액션 버튼 */
.todo-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-2);
}

/* 액션 버튼 그룹 */
.todo-card-actions {
  display: flex;
  gap: var(--spacing-1);
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-card:hover .todo-card-actions {
  opacity: 1;
}
```

### 5.4 상태 배지 (StatusBadge)

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  white-space: nowrap;
}

.status-badge.NOT_STARTED {
  color: #536471;
  background-color: rgba(83, 100, 113, 0.12);
}

.status-badge.IN_PROGRESS {
  color: #1A8CD8;
  background-color: rgba(26, 140, 216, 0.12);
}

.status-badge.DONE {
  color: #00BA7C;
  background-color: rgba(0, 186, 124, 0.12);
}

.status-badge.OVERDUE {
  color: #F4212E;
  background-color: rgba(244, 33, 46, 0.12);
}
```

### 5.5 체크박스 (완료 토글)

```css
.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background-color 0.2s;
  flex-shrink: 0;
}

.checkbox:hover {
  border-color: var(--color-accent);
  background-color: rgba(26, 140, 216, 0.1);
}

.checkbox.checked {
  border-color: #00BA7C;
  background-color: #00BA7C;
  color: #FFFFFF;
}
```

### 5.6 네비게이션 사이드바

X(Twitter)의 사이드바 네비게이션 구조를 참조한다.

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: 12px var(--spacing-4);
  border-radius: 9999px;
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: var(--color-bg-tertiary);
}

.nav-item.active {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

/* 활성 카테고리는 왼쪽 도트 표시 */
.nav-item.active::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-accent);
  margin-right: -12px;
}

/* 사이드바 하단 사용자 프로필 영역 */
.nav-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: 12px var(--spacing-4);
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;
}

.nav-user:hover {
  background-color: var(--color-bg-tertiary);
}
```

### 5.7 탭 필터 (상태 필터)

X(Twitter)의 Top/Latest 탭 스타일을 참조한다.

```css
.tab-list {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-item {
  flex: 1;
  padding: var(--spacing-4) var(--spacing-4);
  text-align: center;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 4px solid transparent;
  transition: background-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.tab-item.active {
  color: var(--color-text-primary);
  font-weight: var(--font-bold);
  border-bottom-color: var(--color-accent);
}
```

### 5.8 모달

```css
/* 오버레이 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.15s ease;
}

/* 모달 컨테이너 */
.modal {
  background-color: var(--color-bg);
  border-radius: 16px;
  padding: var(--spacing-8);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: scaleIn 0.15s ease;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.modal-desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
}
```

### 5.9 로딩 스피너

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* 페이지 전체 로딩 */
.spinner-lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}
```

### 5.10 폼 레이아웃

```css
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.form-label.required::after {
  content: ' *';
  color: #F4212E;
}

/* 날짜 필드 2컬럼 */
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}
```

### 5.11 드롭다운 셀렉트 (카테고리 선택)

```css
.select {
  appearance: none;
  width: 100%;
  background-color: var(--color-bg-secondary);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23536471' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 12px 36px 12px var(--spacing-4);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.select:focus {
  border-color: var(--color-accent);
}
```

### 5.12 하단 네비게이션 바 (모바일)

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 50;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-2);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 10px;
  font-weight: var(--font-medium);
  border-radius: 8px;
  transition: color 0.2s;
}

.bottom-nav-item.active {
  color: var(--color-text-primary);
}

/* 중앙 할일 등록 버튼 */
.bottom-nav-add {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--color-text-primary);
  color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: opacity 0.2s;
}

.bottom-nav-add:hover {
  opacity: 0.85;
}
```

### 5.13 FAB 버튼 (+ 할일 등록, 데스크탑)

```css
.fab {
  position: fixed;
  bottom: var(--spacing-6);
  /* 메인 콘텐츠 영역 내 우측 하단 */
  right: calc(50% - 300px + var(--spacing-6));
  background-color: var(--color-text-primary);
  color: var(--color-bg);
  padding: 14px var(--spacing-6);
  border-radius: 9999px;
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: opacity 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.fab:hover {
  opacity: 0.9;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
```

### 5.14 빈 상태 (Empty State)

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-8);
  text-align: center;
  gap: var(--spacing-4);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.empty-state-desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  max-width: 320px;
  line-height: 1.6;
}
```

---

## 6. 아이콘

[Lucide React](https://lucide.dev) 라이브러리를 사용한다. 선 굵기 `strokeWidth={1.5}`, 기본 크기 `20px`.

```bash
npm install lucide-react
```

### 화면별 주요 아이콘 매핑

| 용도 | Lucide 컴포넌트 | 크기 |
|------|--------------|------|
| 홈 (대시보드) | `<House />` | 22px |
| 카테고리 관리 | `<Tag />` | 22px |
| 설정 | `<Settings />` | 22px |
| 로그아웃 | `<LogOut />` | 20px |
| 할일 등록 (FAB) | `<Plus />` | 20px |
| 할일 완료 처리 | `<Check />` | 16px |
| 할일 수정 | `<Pencil />` | 16px |
| 할일 삭제 | `<Trash2 />` | 16px |
| 뒤로가기 | `<ArrowLeft />` | 20px |
| 상세 보기 | `<ChevronRight />` | 16px |
| 달력 (날짜) | `<Calendar />` | 14px |
| 폴더 (카테고리) | `<Folder />` | 14px |
| 검색 | `<Search />` | 16px |
| 로딩 (spinner 대체) | `<Loader2 />` | 20px, animate-spin |
| 닫기 (모달) | `<X />` | 20px |
| 더보기 | `<MoreHorizontal />` | 18px |
| 테마 라이트 | `<Sun />` | 18px |
| 테마 다크 | `<Moon />` | 18px |
| 언어 | `<Globe />` | 18px |

### 아이콘 사용 예시

```tsx
import { Check, Pencil, Trash2 } from 'lucide-react';

// 카드 액션 버튼
<button className="btn-ghost" aria-label="완료 처리">
  <Check size={16} strokeWidth={2} />
</button>
<button className="btn-ghost" aria-label="수정">
  <Pencil size={16} strokeWidth={1.5} />
</button>
<button className="btn-ghost" style={{ color: '#F4212E' }} aria-label="삭제">
  <Trash2 size={16} strokeWidth={1.5} />
</button>
```

---

## 7. 애니메이션 및 전환

```css
/* 기본 전환 — 호버, 포커스 상태 변화 */
* { transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }

/* 페이드인 (모달 오버레이) */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 스케일인 (모달, 드롭다운) */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* 스피너 회전 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 슬라이드업 (모바일 시트) */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### 전환 시간 원칙

| 상황 | 시간 |
|------|------|
| 호버/포커스 색상 변화 | `0.15s` |
| 모달/드롭다운 열림 | `0.15s` |
| 페이지 전환 | `0.2s` |
| 레이아웃 변화 | `0.3s` |

---

## 8. CSS 변수 전체 정의

`src/styles/variables.css`에 작성한다.

```css
:root {
  /* 색상 — 라이트 모드 기본값 */
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F7F9F9;
  --color-bg-tertiary: #EFF3F4;
  --color-surface: #FFFFFF;
  --color-border: #EFF3F4;
  --color-text-primary: #0F1419;
  --color-text-secondary: #536471;
  --color-text-disabled: #9DA3A8;
  --color-accent: #1A8CD8;
  --color-accent-hover: #1677BF;

  /* 타이포그래피 */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 15px;
  --text-lg: 17px;
  --text-xl: 20px;
  --text-2xl: 24px;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* 간격 */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;

  /* 레이아웃 */
  --sidebar-width: 240px;
  --header-height: 53px;
  --bottom-nav-height: 56px;
  --content-max-width: 600px;

  /* border-radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* 그림자 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
}

/* 다크 모드 */
[data-theme="dark"] {
  --color-bg: #000000;
  --color-bg-secondary: #16181C;
  --color-bg-tertiary: #1E2328;
  --color-surface: #16181C;
  --color-border: #2F3336;
  --color-text-primary: #E7E9EA;
  --color-text-secondary: #71767B;
  --color-text-disabled: #3E4144;
  /* 액센트 색상은 동일하게 유지 */
}
```

### `src/main.tsx`에서 글로벌 스타일 적용

```typescript
import './styles/variables.css';
import './styles/global.css';
```

### `src/styles/global.css` 기본 리셋

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, "Noto Sans KR", sans-serif;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  line-height: 1.5;
  transition: background-color 0.2s, color 0.2s;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}

img {
  max-width: 100%;
  display: block;
}

/* 스크롤바 숨김 (탭, 가로 스크롤 영역) */
.scrollbar-hidden {
  scrollbar-width: none;
}
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.1.0 | 2026-05-29 | 달력 뷰 컴포넌트 추가 — 월간/주간/타임라인 스타일 및 시간 형식 가이드 추가 | Claude |
| 1.0.0 | 2026-05-28 | 최초 작성 — X(Twitter) UI 참조, 색상/타이포/간격/컴포넌트/아이콘/애니메이션/CSS 변수 전체 정의 | ochlo |
