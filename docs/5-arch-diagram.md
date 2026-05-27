# 기술 아키텍처 다이어그램 - Todo List

| 항목       | 내용                                                           |
| ---------- | -------------------------------------------------------------- |
| 프로젝트명 | Todo List Application                                          |
| 버전       | 1.0.0                                                          |
| 작성일     | 2026-05-27                                                     |
| 범위       | 시스템 아키텍처, 백엔드 레이어, 프론트엔드 상태관리, DB 엔티티 |

---

## 1. 전체 시스템 구조

```mermaid
flowchart LR
    A["🌐 Browser<br/>(Client)"]
    B["⚛️ Frontend<br/>React 19 + TypeScript<br/>Zustand + TanStack Query"]
    C["🔧 Backend API<br/>Node.js + Express<br/>JWT Authentication"]
    D["🗄️ Database<br/>PostgreSQL 17"]

    A -->|HTTP/HTTPS| B
    B -->|REST API<br/>/api/v1/*| C
    C -->|SQL Queries<br/>pg driver| D

    style A fill:#e1f5ff
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e9
```

**설명**: 브라우저의 클라이언트에서 시작된 요청이 프론트엔드를 거쳐 REST API로 백엔드에 전달되고, 데이터베이스와 상호작용하는 전체 시스템의 단방향 흐름입니다.

---

## 2. 백엔드 레이어 흐름

```mermaid
flowchart TD
    A["HTTP Request"]
    B["routes/<br/>(REST endpoints)"]
    C["middlewares/<br/>(JWT verify)"]
    D{Auth<br/>Valid?}
    E["controllers/<br/>(Business Logic)"]
    F["db/<br/>(Query Builder)"]
    G["PostgreSQL"]
    H["401/403<br/>Error"]
    I["200/201<br/>Response"]

    A --> B
    B --> C
    C --> D
    D -->|No| H
    D -->|Yes| E
    E --> F
    F --> G
    G --> I

    style A fill:#fff3e0
    style B fill:#ffe0b2
    style C fill:#ffcc80
    style D fill:#ffa726
    style E fill:#fb8c00
    style F fill:#e65100
    style G fill:#bf360c
    style H fill:#ffcdd2
    style I fill:#c8e6c9
```

**설명**: HTTP 요청이 라우트에서 받아져 JWT 인증 미들웨어를 거치고, 검증 실패 시 에러를 반환하며, 성공 시 컨트롤러와 데이터베이스 계층을 거쳐 응답을 반환합니다.

---

## 3. 프론트엔드 상태 관리 구조

```mermaid
flowchart TD
    A["pages/<br/>(Route Pages)"]
    B["components/<br/>(UI Components)"]
    C["Server State<br/>TanStack Query<br/>(todos, categories)"]
    D["Client State<br/>Zustand<br/>(theme, locale)"]
    E["API Client<br/>(axios to Backend)"]
    F["Backend API"]

    A --> B
    B -->|useQuery<br/>useMutation| C
    B -->|useStore| D
    C -->|HTTP Request| E
    D -.->|no sync| F
    E --> F
    F -->|Response| C

    style A fill:#f3e5f5
    style B fill:#ede7f6
    style C fill:#e1bee7
    style D fill:#f8bbd0
    style E fill:#ffccbc
    style F fill:#fff3e0
```

**설명**: 페이지와 컴포넌트에서 서버 상태(TanStack Query)와 클라이언트 상태(Zustand)를 분리하여 관리합니다. 서버 상태는 API를 통해 백엔드와 동기화되고, 클라이언트 상태는 로컬에서만 관리됩니다.

---

## 4. DB 엔티티 관계

```mermaid
erDiagram
    USER ||--o{ CATEGORY : owns
    USER ||--o{ TODO : owns
    CATEGORY ||--o{ TODO : contains

    USER {
        int id PK
        string email UK
        string password
        string name
        string theme
        string locale
        timestamp created_at
        timestamp updated_at
    }

    CATEGORY {
        int id PK
        int user_id FK
        string name
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    TODO {
        int id PK
        int user_id FK
        int category_id FK
        string title
        string description
        boolean is_done
        date start_date
        date end_date
        timestamp created_at
        timestamp updated_at
    }
```

**설명**: User는 다수의 Category와 Todo를 소유하며, Category는 다수의 Todo를 포함합니다. 모든 엔티티는 타임스탬프와 기본키/외래키로 관계가 정의됩니다.

---

## 변경 이력

| 버전  | 날짜       | 변경사항                                                                                     |
| ----- | ---------- | -------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-05-27 | 초기 작성 - 4개 다이어그램 추가 (시스템 구조, 백엔드 레이어, 프론트엔드 상태관리, DB 엔티티) |
