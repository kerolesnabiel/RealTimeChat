# RealTimeChat

A full-stack, real-time messaging platform built with **ASP.NET Core 10** and **React 19**. It supports live 1:1 messaging over SignalR, JWT authentication with refresh-token rotation, message delivery/read receipts, encrypted message storage, and profile image uploads to Azure Blob Storage.

**Live demo:** [chat-time-web.vercel.app](https://chat-time-web.vercel.app/)
**API (Swagger):** [chat-time.runasp.net/swagger](https://chat-time.runasp.net/)

> This is a monorepo containing the backend API (`RealTimeChatAPI`) and the frontend SPA (`RealTimeChatWebApp`).

---

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Features](#features)
- [API reference](#api-reference)
- [Real-time events (SignalR)](#real-time-events-signalr)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Database](#database)

---

## Overview

RealTimeChat is a portfolio project demonstrating a production-style backend built with vertical-slice architecture and a modern React frontend consuming it over REST + SignalR. Every backend feature (register a user, send a message, mark a message as read, etc.) is self-contained in its own file, holding its request/response models, validation, business logic, and endpoint mapping together — no generic controllers or bloated services.

## Architecture

**Backend — vertical slices + CQRS-style handlers**

- Each feature under `Features/` (e.g. `Features/Chats/SendMessage.cs`) defines its own `Command`/`Query`, `FluentValidation` validator, handler, and minimal-API `Endpoint` in a single file.
- `ICommand`/`IQuery` + `ICommandHandler`/`IQueryHandler` marker interfaces (`Common/Messaging`) are auto-discovered and registered via **Scrutor** assembly scanning (`DependencyInjection.cs`).
- Every command handler is wrapped by a `ValidationDecorator` that runs the matching FluentValidation validator before the handler executes.
- Endpoints implement `IEndpoint` and self-register via reflection (`EndpointExtensions.AddEndpoints` / `MapEndpoints`) — adding a new feature never requires touching `Program.cs`.
- Centralized error handling via `GlobalExceptionHandler` + RFC 7807 `ProblemDetails`, with typed exceptions (`NotFoundException`, `ConflictException`, `ForbiddenException`, `BadRequestException`).
- Chat messages are encrypted at rest using ASP.NET Core Data Protection (`MessageEncryptionService`).

**Frontend — React SPA**

- Route-level access control via `PublicRoute` / `ProtectedRoute` wrapper components.
- `zustand` store (`authStore`) holds the JWT/refresh-token session; an Axios interceptor (`apiClient.ts`) transparently refreshes an expired access token and retries the original request.
- A dedicated SignalR client module (`signalr/chatHub.ts`) manages a single shared hub connection (auto-reconnect, single in-flight `start()`), exposed to the UI through the `useChatHub` hook.
- `react-hook-form` + `zod` for form state and schema validation across auth and profile forms.

```
┌────────────────────┐        REST (JWT Bearer)        ┌──────────────────────┐
│                     │ ───────────────────────────────▶│                      │
│  RealTimeChatWebApp │                                  │   RealTimeChatAPI    │
│  (React + Vite)     │◀───────────────────────────────  │  (ASP.NET Core 10)   │
│  Vercel             │                                  │  MonsterASP.NET      │
│                     │◀═══════════ SignalR Hub ════════▶│                      │
└────────────────────┘      (/api/hubs/chat, WebSockets) └──────────┬───────────┘
                                                                     │
                                                       ┌─────────────┼─────────────┐
                                                       ▼             ▼             ▼
                                                 SQL Server    Azure Blob     Data Protection
                                                 (EF Core)     Storage        (message encryption)
```

## Tech stack

**Backend**
- ASP.NET Core 10 (Minimal APIs)
- Entity Framework Core 10 + SQL Server
- SignalR (real-time hub)
- JWT Bearer authentication + refresh tokens
- FluentValidation
- Mapster (object mapping)
- Scrutor (assembly scanning / decoration for DI)
- Azure.Storage.Blobs (profile image storage)
- ASP.NET Core Data Protection (message encryption at rest)
- Swashbuckle / Swagger (OpenAPI docs)

**Frontend**
- React 19 + TypeScript + Vite
- React Router 8
- Zustand (auth/session state)
- React Hook Form + Zod (forms & validation)
- Axios (with auto access-token refresh)
- `@microsoft/signalr` (real-time client)
- Tailwind CSS 4
- Lucide React (icons)

**Infra / CI-CD**
- GitHub Actions → build/test/publish backend → deploy to **MonsterASP.NET**
- GitHub Actions → build frontend → deploy to **Vercel**

## Project structure

```
RealTimeChat/
├── RealTimeChatAPI/
│   ├── Authentication/       # Password hashing, JWT provider, current-user context
│   ├── Common/
│   │   ├── Behaviors/         # ValidationDecorator (pipeline behavior)
│   │   ├── Constants/         # Chat types, roles, SignalR event names
│   │   ├── Dtos/               # Response DTOs
│   │   ├── Endpoints/          # IEndpoint pattern + self-registration
│   │   ├── Exceptions/         # Typed domain exceptions
│   │   ├── Messaging/          # ICommand/IQuery/handler abstractions
│   │   └── Services/           # Message encryption
│   ├── Database/               # ApplicationDbContext + EF Core migrations
│   ├── Features/
│   │   ├── Chats/               # Create/list/read chats, send & sync messages
│   │   ├── Messages/            # Edit/delete/get a single message
│   │   └── Users/               # Register, login, refresh, profile, search
│   ├── Hubs/ChatHub.cs          # SignalR hub (delivery/read receipts)
│   ├── Models/                  # EF Core entities (User, Chat, Message, ...)
│   ├── Storage/                 # Azure Blob Storage service
│   ├── DependencyInjection.cs   # Service registration (auth, EF, SignalR, DI scanning)
│   └── Program.cs
│
├── RealTimeChatWebApp/
│   ├── src/
│   │   ├── api/                 # Axios API clients (auth, users, chats)
│   │   ├── components/
│   │   │   ├── Route/            # ProtectedRoute / PublicRoute
│   │   │   ├── chat/              # Chat list, conversation view, message bubble, etc.
│   │   │   └── profile/           # Profile editing, password change, avatar, delete account
│   │   ├── hooks/                # useChatHub, useChats, useChatMessages, useUserSearch, ...
│   │   ├── pages/                 # Home, Login, Signup, Chats, Profile, ...
│   │   ├── signalr/chatHub.ts     # SignalR connection lifecycle + typed event helpers
│   │   ├── store/authStore.ts     # Zustand auth/session store
│   │   └── utils/
│   └── vite.config.ts
│
└── RealTimeChat.slnx
```

## Features

- **Authentication** — register/login with hashed passwords, short-lived JWT access tokens, rotating refresh tokens, and silent token refresh on the client.
- **Direct messaging** — start a 1:1 chat, send messages, paginate message history (before/after a given message).
- **Delivery & read receipts** — per-message and bulk "mark as delivered" / "mark as read up to" operations, pushed live to the sender over SignalR.
- **Message lifecycle** — edit and soft-delete your own messages, with live `MessageEdited` / `MessageDeleted` events to the other participant.
- **Encrypted storage** — message text is encrypted at rest via ASP.NET Core Data Protection.
- **User profiles** — update profile info, change password, upload/remove a profile image (Azure Blob Storage), search for other users, delete account.
- **Group-chat-ready schema** — the data model already supports `ChatType.Group` and member roles (`Owner`/`Admin`/`Member`); current endpoints expose direct-chat creation, with the hub broadcasting to SignalR groups for future group chat support.
- **API docs** — interactive Swagger UI in development.

## API reference

Base path: `/api` (all endpoints except register/login/refresh require a `Bearer` JWT).

### Users

| Method | Route | Description |
|---|---|---|
| POST | `/users/register` | Create a new account |
| POST | `/users/login` | Authenticate, receive access + refresh tokens |
| POST | `/users/refresh-token` | Exchange a refresh token for a new access token |
| GET | `/users` | Search users |
| GET | `/users/{id}` | Get a user by id |
| PATCH | `/users/me` | Update the current user's profile |
| PUT | `/users/me/change-password` | Change password |
| PUT | `/users/me/image` | Upload/replace profile image |
| DELETE | `/users/me/image` | Remove profile image |
| DELETE | `/users/me` | Delete the current account |

### Chats

| Method | Route | Description |
|---|---|---|
| GET | `/chats` | List the current user's chats |
| GET | `/chats/{id}` | Get a single chat |
| POST | `/chats/direct/{userId}` | Get or create a direct chat with another user |
| GET | `/chats/{chatId}/messages` | Get the latest messages in a chat |
| GET | `/chats/{chatId}/messages/before/{messageId}` | Paginate older messages |
| GET | `/chats/{chatId}/messages/after/{messageId}` | Paginate newer messages |
| POST | `/chats/{id}/messages` | Send a message |

### Messages

| Method | Route | Description |
|---|---|---|
| GET | `/messages/{id}` | Get a single message |
| PATCH | `/messages/{id}` | Edit a message |
| DELETE | `/messages/{id}` | Delete a message |

## Real-time events (SignalR)

Hub endpoint: **`/api/hubs/chat`** (JWT required via `accessTokenFactory`).

**Client → Server (hub methods)**

| Method | Description |
|---|---|
| `MarkMessagesAsDelivered()` | Marks all pending messages for the current user as delivered |
| `MarkMessageAsDelivered(messageId)` | Marks a single message as delivered |
| `MarkMessagesAsReadUpTo(messageId)` | Marks all messages up to and including `messageId` as read |

**Server → Client (events)**

| Event | Description |
|---|---|
| `MessageReceived` | A new message was sent to this user/chat |
| `MessageEdited` | An existing message was edited |
| `MessageDeleted` | A message was deleted |
| `MessageDelivered` | A single message delivery receipt |
| `MessagesDelivered` | Bulk delivery receipts |
| `MessagesRead` | Read receipts up to a given message |

## Getting started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js 24+](https://nodejs.org/)
- SQL Server (LocalDB, a container, or a full instance)
- An Azure Storage account/emulator (e.g. [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite)) for profile images

### Backend setup

```bash
cd RealTimeChatAPI

# Configure secrets (or edit appsettings.Development.json)
dotnet user-secrets set "Jwt:Secret" "<a-long-random-secret>"
dotnet user-secrets set "ConnectionStrings:RealTimeChatDb" "Server=localhost;Database=RealTimeChatDb;Trusted_Connection=True;TrustServerCertificate=True"
dotnet user-secrets set "ConnectionStrings:BlobStorage" "UseDevelopmentStorage=true"

dotnet restore
dotnet run
```

EF Core migrations are applied automatically on startup in the `Development` environment (`app.ApplyMigrations()`), and Swagger UI is available at `/swagger`.

### Frontend setup

```bash
cd RealTimeChatWebApp

npm install

# create a .env file
echo "VITE_API_URL=https://localhost:<api-port>/api" >> .env
echo "VITE_SIGNALR_CHAT_HUB_URL=https://localhost:<api-port>/api/hubs/chat" >> .env

npm run dev
```

## Configuration

### Backend (`appsettings.json` / user secrets)

| Key | Description |
|---|---|
| `ConnectionStrings:RealTimeChatDb` | SQL Server connection string |
| `ConnectionStrings:BlobStorage` | Azure Blob Storage connection string (or `UseDevelopmentStorage=true` for Azurite) |
| `Jwt:Secret` | HMAC-SHA256 signing key for access tokens |
| `Jwt:Issuer` / `Jwt:Audience` | JWT issuer/audience |
| `Jwt:ExpirationInMinutes` | Access token lifetime |
| `Jwt:RefreshTokenExpirationInDays` | Refresh token lifetime |
| `Origins` | Allowed CORS origins for the frontend |

### Frontend (`.env`)

| Key | Description |
|---|---|
| `VITE_API_URL` | Base URL of the REST API |
| `VITE_SIGNALR_CHAT_HUB_URL` | URL of the SignalR chat hub |

## Deployment

CI/CD is handled by GitHub Actions, triggered separately per app based on changed paths:

- **`deploy-backend.yml`** — build → test → `dotnet publish` → deploy to **MonsterASP.NET** on every push to `main` that touches `RealTimeChatAPI/**`.
- **`deploy-frontend.yml`** — `vercel build` → `vercel deploy --prod` on every push to `main` that touches `RealTimeChatWebApp/**`.

## Database

EF Core Code-First with migrations tracked in `RealTimeChatAPI/Database/Migrations`. Core entities:

- **User** — account, hashed password, refresh token, profile image, bio
- **Chat** — direct or group, optional name/image, tracks `LastMessageAt`
- **ChatMember** — join table with role, joined/left timestamps, mute, and last-read-message pointer
- **Message** — text (encrypted at rest), edit/delete timestamps
- **MessageReceipt** — per-user delivery/read timestamps for a message
