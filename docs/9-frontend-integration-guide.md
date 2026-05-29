# 프론트엔드 통합 가이드 - Todo List

| 항목 | 내용 |
|------|------|
| 버전 | 1.0.0 |
| 작성일 | 2026-05-28 |
| 작성자 | ochlo |
| 참조 문서 | `docs/2-PRD.md` v2.0.1, `docs/4-project-structure.md` v1.0.0, `docs/8-wireframes.md` v1.0.0 |

---

## 목차

1. [기술 스택 및 환경 설정](#1-기술-스택-및-환경-설정)
2. [백엔드 API 개요](#2-백엔드-api-개요)
3. [TypeScript 타입 정의](#3-typescript-타입-정의)
4. [axios 클라이언트 설정](#4-axios-클라이언트-설정)
5. [API 함수 구현](#5-api-함수-구현)
6. [Zustand 스토어](#6-zustand-스토어)
7. [TanStack Query 훅](#7-tanstack-query-훅)
8. [i18n 설정](#8-i18n-설정)
9. [React Router 및 PrivateRoute](#9-react-router-및-privateroute)
10. [화면별 연동 가이드](#10-화면별-연동-가이드)
11. [에러 처리 가이드](#11-에러-처리-가이드)
12. [테마 및 언어 동적 적용](#12-테마-및-언어-동적-적용)

---

## 1. 기술 스택 및 환경 설정

### 기술 스택

| 분류 | 라이브러리 | 버전/비고 |
|------|-----------|----------|
| UI 프레임워크 | React | 19 |
| 언어 | TypeScript | strict 모드 필수 |
| 빌드 도구 | Vite | `@` 경로 alias 설정 |
| 라우팅 | React Router | v6 이상 |
| 전역 상태 | Zustand | 인증 토큰, 사용자 정보, UI 필터 |
| 서버 상태 | TanStack Query | API 캐싱, 자동 재조회 |
| HTTP 클라이언트 | axios | 인터셉터로 토큰 자동 주입 |
| 다국어 | react-i18next + i18next | ko/en 지원 |

### 환경 변수 (`frontend/.env`)

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DEFAULT_LOCALE=ko
VITE_DEFAULT_THEME=light
```

> Vite 환경 변수는 `VITE_` 접두사가 없으면 클라이언트 번들에 포함되지 않는다.
> 코드에서는 `import.meta.env.VITE_API_BASE_URL` 형태로 접근한다.

### 프로젝트 초기화

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom zustand @tanstack/react-query axios react-i18next i18next
```

### vite.config.ts — `@` alias 설정

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

---

## 2. 백엔드 API 개요

### 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL | `http://localhost:3000/api/v1` |
| 인증 방식 | `Authorization: Bearer <JWT>` 헤더 |
| 토큰 만료 | 7일(7d) — 리프레시 토큰 없음, 만료 시 재로그인 |
| 토큰 저장 위치 | `localStorage` |
| Content-Type | `application/json` |

### 공통 응답 형식

```typescript
// 단건 성공
{ "data": { ...리소스 } }

// 목록 성공
{ "data": [ ...리소스 배열 ], "total": 42 }

// 에러
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### 에러 코드 목록

| code | HTTP | 설명 | 프론트엔드 처리 |
|------|------|------|----------------|
| `UNAUTHORIZED` | 401 | 토큰 없음/만료 | `/login` 리다이렉트 |
| `INVALID_CREDENTIALS` | 401 | 이메일/비밀번호 불일치, 현재 비밀번호 오류 | 폼 에러 메시지 표시 |
| `FORBIDDEN` | 403 | 타인 리소스 접근 (미존재 포함) | 홈으로 리다이렉트 또는 에러 표시 |
| `NOT_FOUND` | 404 | 리소스 없음 | 에러 페이지 |
| `VALIDATION_ERROR` | 400 | 입력값 형식 오류, 기본 카테고리 수정/삭제 시도 | 해당 필드 에러 메시지 |
| `DUPLICATE_EMAIL` | 409 | 이메일 중복 | 이메일 필드 에러 |
| `DUPLICATE_CATEGORY` | 409 | 카테고리명 중복 | 이름 필드 에러 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 | 일반 에러 메시지 |

### 전체 엔드포인트 목록

```
# 인증 (인증 불필요)
POST   /auth/register          회원가입
POST   /auth/login             로그인

# 내 정보 (인증 필요)
GET    /auth/me                내 정보 조회
PUT    /auth/me                이름/비밀번호 수정
DELETE /auth/me                회원 탈퇴

# 사용자 설정 (인증 필요)
PATCH  /users/me/settings      테마/언어 설정 변경

# 카테고리 (인증 필요)
GET    /categories             카테고리 목록 조회
POST   /categories             카테고리 생성
PUT    /categories/:id         카테고리 수정
DELETE /categories/:id         카테고리 삭제

# 할일 (인증 필요)
GET    /todos                  할일 목록 조회 (?categoryId=&status=)
POST   /todos                  할일 생성
GET    /todos/:id              할일 단건 조회
PUT    /todos/:id              할일 수정
DELETE /todos/:id              할일 삭제
PATCH  /todos/:id/done         할일 완료 처리
```

### 로그아웃 처리

서버 API 없음. 클라이언트에서 `localStorage`의 토큰을 삭제하면 로그아웃 처리된다.

---

## 3. TypeScript 타입 정의

### `types/api.types.ts`

```typescript
export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
```

### `types/user.types.ts`

```typescript
export type Theme = 'light' | 'dark';
export type Locale = 'ko' | 'en';

export interface User {
  id: string;
  email: string;
  name: string;
  theme: Theme;
  locale: Locale;
  created_at: string;
  updated_at: string;
}

// authStore에 저장되는 최소 사용자 정보
export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'theme' | 'locale'>;
```

### `types/category.types.ts`

```typescript
export interface Category {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}
```

### `types/todo.types.ts`

```typescript
export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';

export interface Todo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  start_date: string | null;  // 'YYYY-MM-DD' 형식
  end_date: string | null;    // 'YYYY-MM-DD' 형식
  is_done: boolean;
  status: TodoStatus;         // 서버에서 실시간 계산, DB 미저장
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  category_id?: string;       // 미지정 시 서버가 기본 카테고리 자동 적용
  start_date?: string;        // 'YYYY-MM-DD'
  end_date?: string;          // 'YYYY-MM-DD', start_date 이상이어야 함
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  is_done?: boolean;
}

export interface TodoFilters {
  categoryId?: string;
  status?: TodoStatus;
}
```

---

## 4. axios 클라이언트 설정

### `api/client.ts`

```typescript
import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: localStorage 토큰 자동 주입
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 → 로그아웃 처리
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // authStore.clearAuth()는 순환 import 위험으로 store에서 직접 처리
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

> **주의**: 인터셉터에서 `authStore`를 직접 import하면 순환 참조가 발생할 수 있다.
> 토큰 삭제는 `localStorage.removeItem('token')`으로 처리하고,
> store 동기화는 페이지 진입 시 `localStorage` 값을 읽어 복원하는 방식으로 처리한다.

---

## 5. API 함수 구현

### `api/authApi.ts`

```typescript
import client from './client';
import type { User, AuthUser } from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

export const authApi = {
  register: (body: { email: string; password: string; name: string }) =>
    client.post<ApiResponse<User>>('/auth/register', body),

  login: (body: { email: string; password: string }) =>
    client.post<ApiResponse<{ token: string; user: AuthUser }>>('/auth/login', body),

  getMe: () =>
    client.get<ApiResponse<User>>('/auth/me'),

  updateMe: (body: { name?: string; current_password?: string; new_password?: string }) =>
    client.put<ApiResponse<User>>('/auth/me', body),

  deleteMe: (body: { password: string }) =>
    client.delete<void>('/auth/me', { data: body }),
};
```

> **필드명 주의**: `PUT /auth/me`의 body는 snake_case (`current_password`, `new_password`) 사용.
> 이름만 변경 시 `current_password` 불요. 비밀번호 변경 시에만 필수.

### `api/todoApi.ts`

```typescript
import client from './client';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters } from '@/types/todo.types';
import type { ApiResponse, ApiListResponse } from '@/types/api.types';

export const todoApi = {
  getTodos: (filters?: TodoFilters) =>
    client.get<ApiListResponse<Todo>>('/todos', { params: filters }),

  getTodo: (id: string) =>
    client.get<ApiResponse<Todo>>(`/todos/${id}`),

  createTodo: (body: CreateTodoInput) =>
    client.post<ApiResponse<Todo>>('/todos', body),

  updateTodo: (id: string, body: UpdateTodoInput) =>
    client.put<ApiResponse<Todo>>(`/todos/${id}`, body),

  deleteTodo: (id: string) =>
    client.delete<void>(`/todos/${id}`),

  toggleDone: (id: string) =>
    client.patch<ApiResponse<Todo>>(`/todos/${id}/done`),
};
```

> **필터 파라미터**: `categoryId` (camelCase), `status` (대문자 enum 문자열).

### `api/categoryApi.ts`

```typescript
import client from './client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category.types';
import type { ApiResponse, ApiListResponse } from '@/types/api.types';

export const categoryApi = {
  getCategories: () =>
    client.get<ApiListResponse<Category>>('/categories'),

  createCategory: (body: CreateCategoryInput) =>
    client.post<ApiResponse<Category>>('/categories', body),

  updateCategory: (id: string, body: UpdateCategoryInput) =>
    client.put<ApiResponse<Category>>(`/categories/${id}`, body),

  deleteCategory: (id: string) =>
    client.delete<void>(`/categories/${id}`),
};
```

### `api/userApi.ts`

```typescript
import client from './client';
import type { User, Theme, Locale } from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

export const userApi = {
  updateSettings: (body: { theme?: Theme; locale?: Locale }) =>
    client.patch<ApiResponse<User>>('/users/me/settings', body),
};
```

---

## 6. Zustand 스토어

### `stores/authStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/user.types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

> 페이지 새로고침 후에도 `zustand/middleware`의 `persist`로 `token`과 `user`가 복원된다.

### `stores/uiStore.ts`

```typescript
import { create } from 'zustand';
import type { TodoStatus } from '@/types/todo.types';

interface UiState {
  selectedCategoryId: string | null;
  statusFilter: TodoStatus | null;
  setSelectedCategory: (id: string | null) => void;
  setStatusFilter: (status: TodoStatus | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedCategoryId: null,
  statusFilter: null,
  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
}));
```

---

## 7. TanStack Query 훅

### `App.tsx`에 QueryClientProvider 설정

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60, // 1분
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 라우터 */}
    </QueryClientProvider>
  );
}
```

### `hooks/useTodos.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { todoApi } from '@/api/todoApi';
import type { TodoFilters } from '@/types/todo.types';

export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todoApi.getTodos(filters).then((res) => res.data),
  });
}
```

### `hooks/useTodo.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { todoApi } from '@/api/todoApi';

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todoApi.getTodo(id).then((res) => res.data.data),
    enabled: !!id,
  });
}
```

### `hooks/useTodoMutations.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '@/api/todoApi';
import type { CreateTodoInput, UpdateTodoInput } from '@/types/todo.types';

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTodoInput) => todoApi.createTodo(body).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTodoInput }) =>
      todoApi.updateTodo(id, body).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useToggleTodoDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoApi.toggleDone(id).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}
```

### `hooks/useCategories.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/api/categoryApi';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories().then((res) => res.data),
  });
}
```

### `hooks/useCategoryMutations.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/api/categoryApi';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/types/category.types';

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryInput) =>
      categoryApi.createCategory(body).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryInput }) =>
      categoryApi.updateCategory(id, body).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['todos'] }); // 이관된 할일 반영
    },
  });
}
```

> 카테고리 삭제 시 해당 카테고리 소속 할일이 기본 카테고리로 자동 이관되므로 `todos` 캐시도 무효화한다.

---

## 8. i18n 설정

### `i18n.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from '@/locales/ko/translation.json';
import en from '@/locales/en/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: import.meta.env.VITE_DEFAULT_LOCALE || 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

export default i18n;
```

> `main.tsx`에서 `import '@/i18n'`으로 초기화한다.

### 언어 결정 우선순위

1. 로그인 사용자의 `authStore.user.locale` 저장값
2. 비로그인 시 브라우저 언어 (`navigator.language`)
3. 환경변수 `VITE_DEFAULT_LOCALE` (기본: `ko`)

### 로그인 성공 시 언어/테마 즉시 적용

```typescript
// LoginPage.tsx — 로그인 성공 핸들러
const handleLogin = async (email: string, password: string) => {
  const res = await authApi.login({ email, password });
  const { token, user } = res.data.data;

  authStore.setAuth(token, user);
  i18n.changeLanguage(user.locale);                // 언어 즉시 적용
  document.documentElement.dataset.theme = user.theme; // 테마 즉시 적용
  navigate('/');
};
```

### 번역 파일 키 구조 예시 (`locales/ko/translation.json`)

```json
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "수정",
    "loading": "로딩 중...",
    "confirm": "확인"
  },
  "status": {
    "NOT_STARTED": "시작 전",
    "IN_PROGRESS": "진행 중",
    "DONE": "완료",
    "OVERDUE": "기간 초과"
  },
  "auth": {
    "login": "로그인",
    "register": "회원가입",
    "logout": "로그아웃",
    "email": "이메일",
    "password": "비밀번호",
    "name": "이름"
  },
  "todo": {
    "title": "제목",
    "description": "설명",
    "category": "카테고리",
    "startDate": "시작일",
    "endDate": "종료일",
    "createTodo": "할일 등록",
    "editTodo": "할일 수정",
    "markDone": "완료 처리",
    "empty": "해당 조건의 할일이 없습니다."
  },
  "category": {
    "manage": "카테고리 관리",
    "add": "카테고리 추가",
    "default": "기본 카테고리",
    "all": "전체"
  },
  "settings": {
    "title": "설정",
    "theme": "테마",
    "themeLight": "라이트 모드",
    "themeDark": "다크 모드",
    "language": "언어",
    "saveName": "이름 저장",
    "changePassword": "비밀번호 변경",
    "currentPassword": "현재 비밀번호",
    "newPassword": "새 비밀번호",
    "deleteAccount": "회원 탈퇴"
  },
  "error": {
    "invalidCredentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "duplicateEmail": "이미 사용 중인 이메일입니다.",
    "duplicateCategory": "이미 사용 중인 카테고리 이름입니다.",
    "invalidDateRange": "종료 날짜는 시작 날짜보다 같거나 이후여야 합니다.",
    "defaultCategoryProtected": "기본 카테고리는 수정하거나 삭제할 수 없습니다.",
    "forbidden": "접근 권한이 없습니다.",
    "serverError": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  }
}
```

---

## 9. React Router 및 PrivateRoute

### `router/index.tsx`

```typescript
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TodoCreatePage from '@/pages/TodoCreatePage';
import TodoEditPage from '@/pages/TodoEditPage';
import TodoDetailPage from '@/pages/TodoDetailPage';
import CategoryPage from '@/pages/CategoryPage';
import SettingsPage from '@/pages/SettingsPage';

function PrivateRoute() {
  const token = useAuthStore((s) => s.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/" replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/todos/new', element: <TodoCreatePage /> },
      { path: '/todos/:id/edit', element: <TodoEditPage /> },
      { path: '/todos/:id', element: <TodoDetailPage /> },
      { path: '/categories', element: <CategoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);
```

### `App.tsx`

```typescript
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '@/router';
import '@/i18n';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

---

## 10. 화면별 연동 가이드

### S-01 · 로그인 (`/login`)

**연동 API**: `POST /auth/login`

**요청 body**:
```json
{ "email": "user@example.com", "password": "Test1234!" }
```

**성공 응답** (`200`):
```json
{
  "data": {
    "token": "eyJ...",
    "user": { "id": "...", "email": "...", "name": "홍길동", "theme": "light", "locale": "ko" }
  }
}
```

**처리 로직**:
1. `authStore.setAuth(token, user)` 호출 → localStorage에 토큰 저장
2. `i18n.changeLanguage(user.locale)` — 저장된 언어 즉시 적용
3. `document.documentElement.dataset.theme = user.theme` — 저장된 테마 즉시 적용
4. `/`로 리다이렉트

**에러 처리**:
- `401 INVALID_CREDENTIALS`: "이메일 또는 비밀번호가 올바르지 않습니다." 폼 하단에 표시

---

### S-02 · 회원가입 (`/register`)

**연동 API**: `POST /auth/register`

**요청 body**:
```json
{ "email": "user@example.com", "password": "Test1234!", "name": "홍길동" }
```

**성공 응답** (`201`): 생성된 User 객체 (password 제외)

**처리 로직**: 성공 시 `/login`으로 이동 (자동 로그인 없음)

**에러 처리**:
- `409 DUPLICATE_EMAIL`: 이메일 필드 하단 에러
- `400 VALIDATION_ERROR`: 비밀번호 규칙(8자+영문+숫자), 이름 길이 오류

---

### S-03 · 할일 대시보드 (`/`)

**연동 API**: `GET /todos?categoryId=&status=`

**쿼리 파라미터 구성**:
```typescript
// uiStore에서 현재 필터 읽어 useTodos에 전달
const { selectedCategoryId, statusFilter } = useUiStore();
const { data } = useTodos({
  categoryId: selectedCategoryId ?? undefined,
  status: statusFilter ?? undefined,
});
```

**응답 구조**:
```json
{
  "data": [
    {
      "id": "...", "title": "...", "status": "IN_PROGRESS",
      "category_id": "...", "is_done": false,
      "start_date": "2026-05-27", "end_date": "2026-05-30", ...
    }
  ],
  "total": 4
}
```

**주요 동작**:
- 카테고리 탭 클릭 → `uiStore.setSelectedCategory(id)` → `useTodos` 자동 재조회
- 상태 필터 탭 클릭 → `uiStore.setStatusFilter(status)` → 자동 재조회
- 완료 버튼 → `useToggleTodoDone(id)` → 성공 시 `['todos']` 캐시 무효화
- 삭제 버튼 → Modal 확인 → `useDeleteTodo(id)` → 캐시 무효화

---

### S-04 · 할일 등록 (`/todos/new`)

**연동 API**: `POST /todos`

**요청 body** (모든 필드 snake_case):
```json
{
  "title": "2분기 캠페인 기획안",
  "description": "상세 내용...",
  "category_id": "uuid-here",
  "start_date": "2026-05-27",
  "end_date": "2026-05-30"
}
```

**주의사항**:
- `category_id` 미지정 시 서버가 기본 카테고리 자동 적용
- `end_date >= start_date` 서버에서 검증 (`400 VALIDATION_ERROR`)
- 클라이언트에서도 사전 검증 권장

---

### S-05 · 할일 수정 (`/todos/:id/edit`)

**연동 API**: `GET /todos/:id` + `PUT /todos/:id`

**PUT 요청 body**: 변경할 필드만 포함 (partial update)
```json
{ "title": "수정된 제목", "is_done": true }
```

**주의사항**:
- `403 FORBIDDEN` 수신 시 `/`로 리다이렉트 (보안 정책: 미존재와 권한없음 모두 403)

---

### S-06 · 할일 상세 (`/todos/:id`)

**연동 API**: `GET /todos/:id`

**완료 처리**: `PATCH /todos/:id/done` (body 없음)
- `is_done=true` 설정, `status`가 `DONE`으로 즉시 변경됨
- 이미 DONE 상태인 경우 완료 버튼 `disabled` 처리

---

### S-07 · 카테고리 관리 (`/categories`)

**연동 API**: `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`

**기본 카테고리 보호 UI 규칙**:
- `is_default === true`인 카테고리의 수정/삭제 버튼을 `disabled` 처리
- 커서 `not-allowed`, 색상 회색

**삭제 시 Modal 문구**:
> "이 카테고리를 삭제하면 포함된 할일이 '기본' 카테고리로 이동됩니다. 삭제하시겠습니까?"

**삭제 성공 후**: `categories`와 `todos` 쿼리 캐시 모두 무효화 (이관된 할일 반영)

---

### S-08 · 설정 (`/settings`)

#### 테마/언어 변경

**연동 API**: `PATCH /users/me/settings`

```typescript
// 테마 변경 핸들러
const handleThemeChange = async (theme: Theme) => {
  await userApi.updateSettings({ theme });
  useAuthStore.getState().user && useAuthStore.setState((s) => ({
    user: s.user ? { ...s.user, theme } : null,
  }));
  document.documentElement.dataset.theme = theme; // 즉시 적용
};

// 언어 변경 핸들러
const handleLocaleChange = async (locale: Locale) => {
  await userApi.updateSettings({ locale });
  useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, locale } : null }));
  i18n.changeLanguage(locale); // 즉시 적용
};
```

#### 이름 변경

**연동 API**: `PUT /auth/me`
```json
{ "name": "새이름" }
```
> `current_password` 불요. 이름만 변경할 때는 이름 필드만 전송.

#### 비밀번호 변경

**연동 API**: `PUT /auth/me`
```json
{ "current_password": "OldPass123", "new_password": "NewPass456" }
```

#### 회원 탈퇴

**연동 API**: `DELETE /auth/me`
```json
{ "password": "현재비밀번호" }
```
성공(`204`) 시: `authStore.clearAuth()` → `/login` 이동

---

## 11. 에러 처리 가이드

### axios 에러에서 코드 추출

```typescript
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

function getApiErrorCode(error: unknown): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse)?.error?.code ?? 'UNKNOWN';
  }
  return 'UNKNOWN';
}

function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse)?.error?.message ?? '오류가 발생했습니다.';
  }
  return '오류가 발생했습니다.';
}
```

### 화면별 에러 처리 패턴

```typescript
// useMutation의 onError 활용
const createTodo = useCreateTodo();

const handleSubmit = async (input: CreateTodoInput) => {
  try {
    await createTodo.mutateAsync(input);
    navigate('/');
  } catch (error) {
    const code = getApiErrorCode(error);
    if (code === 'VALIDATION_ERROR') {
      setFieldError(getApiErrorMessage(error));
    }
  }
};
```

### 403 처리 정책

백엔드에서 리소스 미존재와 권한없음 모두 `403`으로 반환한다 (리소스 존재 여부 노출 방지).
프론트엔드에서 `403` 수신 시 "접근 권한이 없습니다." 메시지를 표시하거나 홈으로 리다이렉트한다.

---

## 12. 테마 및 언어 동적 적용

### 테마 적용 방식

CSS 변수와 `data-theme` 속성 또는 Tailwind `dark:` 클래스를 사용한다.

```css
/* CSS 변수 방식 */
:root[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #111827;
  --color-surface: #f3f4f6;
}

:root[data-theme="dark"] {
  --color-bg: #111827;
  --color-text: #f9fafb;
  --color-surface: #1f2937;
}
```

### 초기 테마 설정 (App.tsx)

```typescript
useEffect(() => {
  const user = useAuthStore.getState().user;
  const theme = user?.theme ?? import.meta.env.VITE_DEFAULT_THEME ?? 'light';
  document.documentElement.dataset.theme = theme;
}, []);
```

### 초기 언어 설정 (i18n.ts)

```typescript
// i18n 초기화 시 저장된 locale 적용
const savedUser = JSON.parse(localStorage.getItem('auth-storage') ?? '{}')?.state?.user;
const initialLang = savedUser?.locale ?? navigator.language.split('-')[0] ?? 'ko';

i18n.use(initReactI18next).init({
  lng: ['ko', 'en'].includes(initialLang) ? initialLang : 'ko',
  // ...
});
```

### status 파생값 — 재계산 금지

서버에서 전달된 `status` 필드를 그대로 사용한다. 프론트엔드에서 재계산하지 않는다.

```typescript
// 올바른 방식
const badge = todo.status; // 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'

// 잘못된 방식 (금지)
const today = new Date();
const badge = today > new Date(todo.end_date!) ? 'OVERDUE' : 'IN_PROGRESS';
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.1.0 | 2026-05-29 | 달력 뷰 및 시간 형식 추가 — CalendarView/MonthlyView/WeeklyView/TimelineView, 시간 선택(datetime-local), 시간 형식 개선(formatDateRange), 완료 원복 기능 | Claude |
| 1.0.0 | 2026-05-28 | 최초 작성 — 백엔드 API 기반 프론트엔드 통합 가이드 전체 작성 | ochlo |
