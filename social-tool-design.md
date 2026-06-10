# Social Media Management Tool — Complete Product Specification

> **Project Name**: SocialForge (working title)
> **Competitor**: Postiz, Buffer, Hootsuite
> **Target Users**: Independent developers, small teams, creators
> **Team Size**: 2 people
> **Version**: v1.0 MVP
> **Last Updated**: 2026-06-10

---

## Table of Contents

1. [Tech Stack Decisions](#1-tech-stack-decisions)
2. [Database Schema](#2-database-schema)
3. [Core Features (MVP)](#3-core-features-mvp)
4. [API Endpoints](#4-api-endpoints)
5. [Docker Deployment Architecture](#5-docker-deployment-architecture)
6. [Pricing Model](#6-pricing-model)
7. [UI/UX Wireframe Descriptions](#7-uiux-wireframe-descriptions)

---

## 1. Tech Stack Decisions

### Frontend
| Choice | Technology | Reason |
|--------|-----------|--------|
| Framework | Next.js 15 (App Router) | SSR/SSG, API routes, React ecosystem |
| UI Library | shadcn/ui + Tailwind CSS 4 | Beautiful, accessible, fully customizable |
| State Management | Zustand | Lightweight, minimal boilerplate |
| Rich Text Editor | TipTap | Social post editor with formatting |
| Calendar View | react-big-calendar or custom | Drag-and-drop post scheduling |
| Charts | Recharts | Analytics dashboards |
| Forms | React Hook Form + Zod | Type-safe form validation |
| i18n | next-intl | Multi-language support |

### Backend
| Choice | Technology | Reason |
|--------|-----------|--------|
| Runtime | Node.js 22 (via Next.js) | Full-stack JS, one language |
| ORM | Drizzle ORM | Type-safe, SQL-first, lightweight |
| Database | PostgreSQL 16 | ACID, JSON support, full-text search |
| Cache/Queue | Redis 7 | Job queue (BullMQ), session cache |
| Auth | NextAuth.js v5 (Auth.js) | OAuth, email, multiple providers |
| File Storage | S3-compatible (MinIO self-hosted) | Media uploads, profile pictures |
| Email | Resend or Nodemailer | Transactional emails |
| API Style | REST (with tRPC optional) | Simple, well-documented |

### Infrastructure
| Choice | Technology | Reason |
|--------|-----------|--------|
| Containerization | Docker + Docker Compose | Easy self-hosting |
| Reverse Proxy | Nginx (in container) | SSL termination, routing |
| Monitoring | Uptime Kuma (optional) | Health checks |
| CI/CD | GitHub Actions | Automated testing, Docker builds |

### Social Platform Integrations (MVP)
| Platform | API | Auth Method |
|----------|-----|-------------|
| Twitter/X | Twitter API v2 | OAuth 2.0 (PKCE) |
| LinkedIn | LinkedIn Marketing API | OAuth 2.0 |
| Facebook/Instagram | Meta Graph API | OAuth 2.0 |
| Bluesky | AT Protocol | Session token |
| Mastodon | Mastodon API | OAuth 2.0 |

### Design Decisions Rationale

- **Drizzle over Prisma**: 2-person team needs speed. Drizzle is faster, lighter, SQL-first. No Prisma schema binary, no client generation step.
- **Next.js over separate FE/BE**: Single repo, shared types, one deployment. Next.js API routes handle auth + social integrations. For heavy jobs, offload to BullMQ workers.
- **Redis for BullMQ**: Social media posting needs reliable job scheduling. Redis-backed BullMQ handles retries, delayed jobs, rate limiting.
- **PostgreSQL over SQLite**: Need concurrent writes, JSON queries for post metadata, full-text search for content. SQLite too limiting at scale.
- **shadcn/ui over MUI/Chakra**: No runtime CSS-in-JS. Copy-paste components. Full Tailwind control. Ship 0kb of unused CSS.

---

## 2. Database Schema

### Overview: 15 Tables

```
users ──┬── organizations ──── org_members
        │                          │
        ├── social_accounts ───────┘
        ├── posts ──── post_media ──── media_assets
        │    └─── post_logs
        ├── analytics_snapshots
        └── api_keys
```

### 2.1 `users`
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255),
    username        VARCHAR(100) UNIQUE,
    avatar_url      TEXT,
    bio             VARCHAR(500),
    timezone        VARCHAR(50) DEFAULT 'UTC',
    locale          VARCHAR(10) DEFAULT 'en',
    
    -- Auth fields
    password_hash   VARCHAR(255),           -- For email/password auth
    email_verified  BOOLEAN DEFAULT FALSE,
    
    -- Subscription
    stripe_customer_id  VARCHAR(255),
    subscription_tier   VARCHAR(20) DEFAULT 'free',  -- free, pro, pro-yearly
    subscription_expires_at TIMESTAMPTZ,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
```

### 2.2 `organizations`
```sql
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    logo_url        TEXT,
    settings        JSONB DEFAULT '{}',     -- org-specific settings
    
    -- Plan
    subscription_tier VARCHAR(20) DEFAULT 'free',
    member_limit    INT DEFAULT 3,          -- free=3, pro=10, enterprise=unlimited
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_slug ON organizations(slug);
```

### 2.3 `org_members`
```sql
CREATE TABLE org_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL DEFAULT 'member',  -- owner, admin, member, viewer
    permissions     JSONB DEFAULT '{}',     -- granular permissions
    
    invited_by      UUID REFERENCES users(id),
    invited_at      TIMESTAMPTZ,
    accepted_at     TIMESTAMPTZ,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_org_members_org ON org_members(organization_id);
```

### 2.4 `social_accounts`
```sql
CREATE TABLE social_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    platform        VARCHAR(30) NOT NULL,   -- twitter, linkedin, facebook, instagram, bluesky, mastodon
    platform_user_id VARCHAR(255) NOT NULL, -- Platform's user ID
    username        VARCHAR(255) NOT NULL,  -- Display username
    display_name    VARCHAR(255),
    avatar_url      TEXT,
    
    -- OAuth tokens (encrypted at rest)
    access_token    TEXT NOT NULL,
    refresh_token   TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Platform-specific metadata
    platform_data   JSONB DEFAULT '{}',     -- followers count, etc.
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active',  -- active, expired, disconnected
    last_synced_at  TIMESTAMPTZ,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(platform, platform_user_id)
);

CREATE INDEX idx_social_accounts_org ON social_accounts(organization_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_status ON social_accounts(status);
```

### 2.5 `posts`
```sql
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    
    -- Content
    content         TEXT NOT NULL,           -- Main text content (Markdown)
    content_json    JSONB,                   -- Structured content (for rich text)
    title           VARCHAR(255),            -- Optional title/headline
    
    -- Media
    media_ids       UUID[] DEFAULT '{}',     -- References to post_media
    
    -- Scheduling
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
        -- draft, scheduled, publishing, published, failed, archived
    scheduled_at    TIMESTAMPTZ,             -- When to publish
    published_at    TIMESTAMPTZ,             -- When actually published
    
    -- Target platforms
    target_platforms VARCHAR(30)[] NOT NULL,  -- ['twitter', 'linkedin']
    
    -- Platform-specific overrides
    platform_overrides JSONB DEFAULT '{}',   -- Per-platform content variations
    
    -- Tags & Categories
    tags            VARCHAR(100)[] DEFAULT '{}',
    category        VARCHAR(100),
    
    -- Analytics
    engagement_score FLOAT,                   -- Computed from analytics
    
    -- Metadata
    metadata        JSONB DEFAULT '{}',       -- Any extra data
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    -- Recurrence (for recurring posts)
    recurrence      JSONB                    -- {"type": "weekly", "days": ["monday"], "time": "09:00"}
);

CREATE INDEX idx_posts_org ON posts(organization_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
```

### 2.6 `post_media`
```sql
CREATE TABLE post_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    media_asset_id  UUID NOT NULL REFERENCES media_assets(id),
    
    sort_order      INT DEFAULT 0,
    alt_text        VARCHAR(500),
    crop_data       JSONB,                   -- {x, y, width, height}
    
    -- Per-platform adjustments
    platform_overrides JSONB DEFAULT '{}',
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_media_post ON post_media(post_id);
```

### 2.7 `media_assets`
```sql
CREATE TABLE media_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    
    -- File info
    filename        VARCHAR(255) NOT NULL,
    original_url    TEXT NOT NULL,           -- Original upload URL
    thumbnail_url   TEXT,                    -- Generated thumbnail
    file_type       VARCHAR(20) NOT NULL,    -- image, video, gif
    mime_type       VARCHAR(100) NOT NULL,
    file_size       BIGINT,                  -- Size in bytes
    
    -- Dimensions (for images)
    width           INT,
    height          INT,
    
    -- Storage
    storage_key     VARCHAR(500) NOT NULL,   -- S3/MinIO key
    storage_provider VARCHAR(20) DEFAULT 's3',
    
    -- Status
    status          VARCHAR(20) DEFAULT 'ready',  -- uploading, processing, ready, failed
    
    -- Metadata
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_org ON media_assets(organization_id);
CREATE INDEX idx_media_type ON media_assets(file_type);
```

### 2.8 `post_logs`
```sql
CREATE TABLE post_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    
    -- Status
    status          VARCHAR(20) NOT NULL,   -- queued, publishing, published, failed
    platform_post_id VARCHAR(255),          -- ID on the platform
    
    -- Error tracking
    error_code      VARCHAR(100),
    error_message   TEXT,
    retry_count     INT DEFAULT 0,
    
    -- Timing
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_logs_post ON post_logs(post_id);
CREATE INDEX idx_post_logs_status ON post_logs(status);
CREATE INDEX idx_post_logs_account ON post_logs(social_account_id);
```

### 2.9 `analytics_snapshots`
```sql
CREATE TABLE analytics_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    post_id         UUID REFERENCES posts(id) ON DELETE SET NULL,
    
    -- Snapshot type
    snapshot_type   VARCHAR(30) NOT NULL,   -- account_daily, post_engagement, growth
    
    -- Date
    snapshot_date   DATE NOT NULL,
    
    -- Metrics
    metrics         JSONB NOT NULL,
    -- Account daily: {followers, following, posts_count, impressions, reach}
    -- Post engagement: {likes, comments, shares, saves, clicks, impressions, reach}
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(social_account_id, snapshot_type, snapshot_date, post_id)
);

CREATE INDEX idx_analytics_account ON analytics_snapshots(social_account_id, snapshot_date);
CREATE INDEX idx_analytics_post ON analytics_snapshots(post_id) WHERE post_id IS NOT NULL;
```

### 2.10 `api_keys`
```sql
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    name            VARCHAR(100) NOT NULL,
    key_hash        VARCHAR(255) NOT NULL,  -- bcrypt hash of the key
    key_prefix      VARCHAR(10) NOT NULL,   -- First 8 chars for identification (sf_xxxx...)
    
    -- Permissions
    scopes          VARCHAR(50)[] DEFAULT '{posts:read,posts:write}',
    
    -- Rate limiting
    rate_limit      INT DEFAULT 100,        -- requests per hour
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active',
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
```

### 2.11 `invite_links`
```sql
CREATE TABLE invite_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by      UUID NOT NULL REFERENCES users(id),
    
    email           VARCHAR(255) NOT NULL,
    role            VARCHAR(20) DEFAULT 'member',
    token           VARCHAR(255) NOT NULL UNIQUE,
    
    accepted        BOOLEAN DEFAULT FALSE,
    accepted_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invite_token ON invite_links(token);
CREATE INDEX idx_invite_email ON invite_links(email);
```

### 2.12 `ai_templates`
```sql
CREATE TABLE ai_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    prompt          TEXT NOT NULL,           -- The AI prompt template
    platform        VARCHAR(30),             -- Platform-specific or null for all
    
    -- Usage
    usage_count     INT DEFAULT 0,
    is_public       BOOLEAN DEFAULT FALSE,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_user ON ai_templates(user_id);
CREATE INDEX idx_templates_public ON ai_templates(is_public) WHERE is_public = TRUE;
```

### 2.13 `content_repurposing`
```sql
CREATE TABLE content_repurposing (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    source_content  TEXT NOT NULL,           -- Original long-form content
    source_type     VARCHAR(30),             -- blog, article, video_transcript
    
    -- Generated variations
    variations      JSONB NOT NULL,          -- Array of {platform, content, tone}
    
    status          VARCHAR(20) DEFAULT 'draft',
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.14 `audit_log`
```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action          VARCHAR(50) NOT NULL,   -- user.login, post.created, account.connected, etc.
    resource_type   VARCHAR(50),            -- post, social_account, organization, etc.
    resource_id     UUID,
    
    details         JSONB DEFAULT '{}',
    ip_address      INET,
    user_agent      TEXT,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_log(organization_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action);
```

### 2.15 `webhook_configs`
```sql
CREATE TABLE webhook_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    url             TEXT NOT NULL,
    events          VARCHAR(50)[] NOT NULL,  -- ['post.published', 'post.failed']
    secret          VARCHAR(255),            -- For HMAC verification
    
    status          VARCHAR(20) DEFAULT 'active',
    last_triggered  TIMESTAMPTZ,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_org ON webhook_configs(organization_id);
```

### Migration Strategy

Use Drizzle Kit for schema management:
```bash
# Generate migration
npx drizzle-kit generate

# Push to database (dev)
npx drizzle-kit push

# Apply migrations (production)
npx drizzle-kit migrate
```

---

## 3. Core Features (MVP)

### P0 — Must Ship (MVP)
| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 1 | **User Authentication** | Email/password + Google/GitHub OAuth via Auth.js | 1 week |
| 2 | **Organization Management** | Create org, invite members, role-based access (owner/admin/member/viewer) | 1 week |
| 3 | **Social Account Connection** | OAuth connect Twitter, LinkedIn, Facebook/Instagram, Bluesky, Mastodon | 2 weeks |
| 4 | **Post Composer** | Rich text editor with media upload, platform-specific previews, character count | 2 weeks |
| 5 | **Post Scheduling** | Calendar view, drag-and-drop scheduling, timezone-aware | 2 weeks |
| 6 | **Auto Publishing** | BullMQ job queue, reliable posting with retries, error handling | 2 weeks |
| 7 | **Media Library** | Upload images/videos, crop/resize, manage assets per org | 1 week |
| 8 | **Basic Analytics** | Per-post metrics (impressions, likes, comments, shares), account growth | 1 week |
| 9 | **Dashboard** | Overview of upcoming posts, recent performance, connected accounts | 1 week |
| 10 | **Self-Hosted Docker Deploy** | One-command Docker Compose setup, .env config | 1 week |

**Total P0: ~14 weeks** (parallelizable to ~10 weeks with 2 people)

### P1 — Should Ship (Fast Follow)
| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 11 | **AI Post Generation** | Generate post drafts from prompts, platform-optimized content | 1 week |
| 12 | **Content Repurposing** | Turn one piece of content into multiple platform posts | 1 week |
| 13 | **AI Templates** | Pre-built templates for common post types (thread, announcement, etc.) | 3 days |
| 14 | **Bulk Scheduling** | CSV upload for batch post scheduling | 3 days |
| 15 | **Post Analytics Deep Dive** | Engagement over time, best posting times, audience demographics | 1 week |
| 16 | **Link Shortening** | Built-in link shortener with click tracking | 3 days |
| 17 | **Keyboard Shortcuts** | Cmd+K command palette, quick actions | 2 days |
| 18 | **Post Approval Workflow** | Multi-step approval for team posts | 3 days |
| 19 | **Webhooks** | Outbound webhooks for post events (published, failed, etc.) | 2 days |
| 20 | **REST API** | Public API for programmatic access, API key management | 1 week |

### P2 — Nice to Have (Later)
| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 21 | **Social Inbox** | Unified inbox for mentions, DMs, comments across platforms | 2 weeks |
| 22 | **Competitor Monitoring** | Track competitor accounts, benchmark performance | 1 week |
| 23 | **Hashtag Suggestions** | AI-powered hashtag recommendations based on content | 3 days |
| 24 | **Content Calendar Export** | Export calendar to Google Calendar, iCal | 2 days |
| 25 | **Automated A/B Testing** | Test different post variations automatically | 1 week |
| 26 | **Brand Guidelines** | Store brand voice, tone, style guides per org | 3 days |
| 27 | **Team Chat** | Built-in team chat for post collaboration | 2 weeks |
| 28 | **Chrome Extension** | Quick post from any webpage | 1 week |
| 29 | **Mobile App** | React Native or PWA mobile app | 4 weeks |
| 30 | **White Label** | Custom branding for agencies | 2 weeks |

---

## 4. API Endpoints

### Base URL: `/api/v1`

### Authentication
```
POST   /auth/register          - Register new user
POST   /auth/login             - Email/password login
POST   /auth/logout            - Logout
GET    /auth/session            - Get current session
POST   /auth/forgot-password    - Send reset email
POST   /auth/reset-password     - Reset password
GET    /auth/callback/:provider - OAuth callback
```

### Users
```
GET    /users/me                - Get current user profile
PUT    /users/me                - Update profile
DELETE /users/me                - Delete account
POST   /users/me/avatar         - Upload avatar
```

### Organizations
```
POST   /organizations                    - Create organization
GET    /organizations                    - List user's organizations
GET    /organizations/:id                - Get organization details
PUT    /organizations/:id                - Update organization
DELETE /organizations/:id                - Delete organization

POST   /organizations/:id/invite         - Invite member
GET    /organizations/:id/members        - List members
PUT    /organizations/:id/members/:uid   - Update member role
DELETE /organizations/:id/members/:uid   - Remove member
```

### Social Accounts
```
GET    /social-accounts                           - List connected accounts
POST   /social-accounts/connect/:platform         - Initiate OAuth flow
GET    /social-accounts/connect/:platform/callback - OAuth callback
GET    /social-accounts/:id                       - Get account details
PUT    /social-accounts/:id                       - Update account settings
DELETE /social-accounts/:id                       - Disconnect account
POST   /social-accounts/:id/sync                  - Force sync account data
GET    /social-accounts/:id/followers             - Get follower list (platform-dependent)
```

### Posts
```
GET    /posts                              - List posts (filterable)
POST   /posts                              - Create post
GET    /posts/:id                          - Get post details
PUT    /posts/:id                          - Update post
DELETE /posts/:id                          - Delete post
POST   /posts/:id/duplicate                - Duplicate post
POST   /posts/:id/publish                  - Publish immediately
POST   /posts/:id/cancel                   - Cancel scheduled post
GET    /posts/:id/logs                     - Get publish logs

-- Bulk operations
POST   /posts/bulk/schedule                - Schedule multiple posts
POST   /posts/bulk/delete                  - Delete multiple posts
```

### Calendar
```
GET    /calendar                           - Get calendar view (month/week/day)
GET    /calendar/available-slots           - Get available scheduling slots
```

### Analytics
```
GET    /analytics/overview                 - Dashboard overview stats
GET    /analytics/account/:id              - Account-level analytics
GET    /analytics/account/:id/growth       - Follower growth over time
GET    /analytics/post/:id                 - Post-level analytics
GET    /analytics/posts/top                - Top performing posts
GET    /analytics/engagement               - Engagement metrics over time
GET    /analytics/best-times               - Optimal posting times
```

### Media
```
POST   /media/upload                       - Upload media file
GET    /media                              - List media assets
GET    /media/:id                          - Get media details
DELETE /media/:id                          - Delete media
PUT    /media/:id                          - Update alt text/crop
GET    /media/:id/url                      - Get signed URL
```

### AI Features
```
POST   /ai/generate-post                   - Generate post from prompt
POST   /ai/repurpose                       - Repurpose content for platforms
POST   /ai/hashtag-suggest                 - Get hashtag suggestions
POST   /ai/optimize                        - Optimize existing post
GET    /ai/templates                       - List AI templates
POST   /ai/templates                       - Create template
```

### API Keys (for external access)
```
GET    /api-keys                           - List API keys
POST   /api-keys                           - Create API key
DELETE /api-keys/:id                       - Revoke API key
```

### Webhooks
```
GET    /webhooks                           - List webhook configs
POST   /webhooks                           - Create webhook
PUT    /webhooks/:id                       - Update webhook
DELETE /webhooks/:id                       - Delete webhook
POST   /webhooks/:id/test                  - Send test payload
```

### API Response Format
```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "content", "message": "Content is required" }
    ]
  }
}
```

### Rate Limiting
| Tier | Requests/min | Requests/hour |
|------|-------------|---------------|
| Free | 30 | 500 |
| Pro | 120 | 5,000 |
| API Key | Configurable (default 100/hr) | Configurable |

### Pagination
```
GET /posts?page=2&limit=20&sort=created_at&order=desc
```

---

## 5. Docker Deployment Architecture

### Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Docker Network                     │
│                  (socialforge-net)                    │
│                                                      │
│  ┌─────────────┐    ┌─────────────┐                 │
│  │   Nginx     │────│  Next.js    │                 │
│  │  (Reverse   │    │  App        │                 │
│  │   Proxy)    │    │  (Port 3000)│                 │
│  │  Port 80/443│    │             │                 │
│  └─────────────┘    └──────┬──────┘                 │
│                            │                         │
│                    ┌───────┴────────┐                │
│                    │                │                │
│              ┌─────▼─────┐  ┌──────▼──────┐        │
│              │ PostgreSQL │  │   Redis     │        │
│              │ (Port 5432)│  │ (Port 6379) │        │
│              └───────────┘  └─────────────┘        │
│                                                     │
│              ┌───────────┐                          │
│              │   MinIO   │                          │
│              │ (S3 compat)│                          │
│              │ (Port 9000)│                          │
│              └───────────┘                          │
│                                                     │
│  Optional:                                          │
│  ┌──────────────┐                                   │
│  │ BullMQ Worker│  (separate container for jobs)    │
│  └──────────────┘                                   │
└──────────────────────────────────────────────────────┘
```

### docker-compose.yml

```yaml
version: '3.9'

services:
  # ── Nginx Reverse Proxy ──
  nginx:
    image: nginx:alpine
    ports:
      - "${HTTP_PORT:-80}:80"
      - "${HTTPS_PORT:-443}:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ./nginx/snippets:/etc/nginx/snippets:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - socialforge-net

  # ── Next.js Application ──
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-socialforge}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-socialforge}
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY:-minioadmin}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT:-587}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=${SMTP_FROM:-noreply@socialforge.dev}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
      # Social platform OAuth
      - TWITTER_CLIENT_ID=${TWITTER_CLIENT_ID:-}
      - TWITTER_CLIENT_SECRET=${TWITTER_CLIENT_SECRET:-}
      - LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID:-}
      - LINKEDIN_CLIENT_SECRET=${LINKEDIN_CLIENT_SECRET:-}
      - FACEBOOK_APP_ID=${FACEBOOK_APP_ID:-}
      - FACEBOOK_APP_SECRET=${FACEBOOK_APP_SECRET:-}
      - BLUESKY_IDENTIFIER=${BLUESKY_IDENTIFIER:-}
      - BLUESKY_PASSWORD=${BLUESKY_PASSWORD:-}
    volumes:
      - ./data/uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - socialforge-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ── BullMQ Worker ──
  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-socialforge}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-socialforge}
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY:-minioadmin}
      # Social platform OAuth (same as app)
      - TWITTER_CLIENT_ID=${TWITTER_CLIENT_ID:-}
      - TWITTER_CLIENT_SECRET=${TWITTER_CLIENT_SECRET:-}
      - LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID:-}
      - LINKEDIN_CLIENT_SECRET=${LINKEDIN_CLIENT_SECRET:-}
      - FACEBOOK_APP_ID=${FACEBOOK_APP_ID:-}
      - FACEBOOK_APP_SECRET=${FACEBOOK_APP_SECRET:-}
      - BLUESKY_IDENTIFIER=${BLUESKY_IDENTIFIER:-}
      - BLUESKY_PASSWORD=${BLUESKY_PASSWORD:-}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - socialforge-net

  # ── PostgreSQL ──
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-socialforge}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB:-socialforge}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    restart: unless-stopped
    networks:
      - socialforge-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-socialforge}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── Redis ──
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    restart: unless-stopped
    networks:
      - socialforge-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── MinIO (S3-compatible object storage) ──
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY:-minioadmin}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY:-minioadmin}
    volumes:
      - minio_data:/data
    ports:
      - "${MINIO_PORT:-9000}:9000"
      - "${MINIO_CONSOLE_PORT:-9001}:9001"
    restart: unless-stopped
    networks:
      - socialforge-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local

networks:
  socialforge-net:
    driver: bridge
```

### Dockerfile (Next.js App)

```dockerfile
# ── Build Stage ──
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm run build

# ── Production Stage ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Dockerfile.worker

```dockerfile
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm run build:worker

USER nodejs

CMD ["node", "dist/worker.js"]
```

### Nginx Configuration

```nginx
upstream app {
    server app:3000;
}

server {
    listen 80;
    server_name ${DOMAIN};

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets with long cache
    location /_next/static/ {
        proxy_pass http://app;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
```

### Deployment Commands

```bash
# 1. Clone and configure
git clone https://github.com/your-org/socialforge.git
cd socialforge
cp .env.example .env
# Edit .env with your values

# 2. Generate secrets
openssl rand -hex 32  # Use for NEXTAUTH_SECRET
openssl rand -hex 32  # Use for POSTGRES_PASSWORD

# 3. Start all services
docker compose up -d

# 4. Run database migrations
docker compose exec app npx drizzle-kit migrate

# 5. Create initial admin user
docker compose exec app npx tsx scripts/create-admin.ts

# 6. Check health
curl http://localhost/api/health

# 7. View logs
docker compose logs -f app
docker compose logs -f worker
```

### Environment Variables (.env.example)

```env
# ── Application ──
DOMAIN=localhost
NEXTAUTH_URL=http://localhost
NEXTAUTH_SECRET=your-secret-here

# ── Database ──
POSTGRES_USER=socialforge
POSTGRES_PASSWORD=change-me-in-production
POSTGRES_DB=socialforge
POSTGRES_PORT=5432

# ── Redis ──
REDIS_PORT=6379

# ── MinIO (S3) ──
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001

# ── Ports ──
HTTP_PORT=80
HTTPS_PORT=443

# ── Email (SMTP) ──
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@socialforge.dev

# ── AI (Optional) ──
OPENAI_API_KEY=

# ── Payments (Optional) ──
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# ── Social Platform OAuth ──
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
BLUESKY_IDENTIFIER=
BLUESKY_PASSWORD=
```

---

## 6. Pricing Model

### Strategy: Open Source Core + Paid Cloud

The tool is fully open source (AGPL-3.0). Self-hosted is free forever with all features. Cloud version adds convenience (hosting, support, managed infra) at a premium.

### Pricing Tiers

#### Self-Hosted (Free Forever)
| Feature | Included |
|---------|----------|
| All features | ✅ |
| Unlimited posts | ✅ |
| Unlimited social accounts | ✅ |
| Unlimited team members | ✅ |
| AI features | ✅ (BYOK — bring your own API key) |
| Analytics | ✅ |
| API access | ✅ |
| Docker deployment | ✅ |
| Community support | ✅ |
| **Cost** | **$0** |

#### Cloud — Starter (Free)
| Feature | Limit |
|---------|-------|
| Social accounts | 3 |
| Team members | 1 |
| Posts per month | 50 |
| AI generations/month | 20 |
| Analytics retention | 7 days |
| Support | Community only |

#### Cloud — Pro ($19/month or $190/year)
| Feature | Limit |
|---------|-------|
| Social accounts | 15 |
| Team members | 5 |
| Posts per month | Unlimited |
| AI generations/month | 500 |
| Analytics retention | 90 days |
| Priority support | ✅ |
| Custom domain | ✅ |
| Webhooks | ✅ |
| API access | ✅ |
| AI features (built-in) | ✅ (500 gen/mo) |

#### Cloud — Team ($49/month or $490/year)
| Feature | Limit |
|---------|-------|
| Social accounts | 30 |
| Team members | 15 |
| Posts per month | Unlimited |
| AI generations/month | 2,000 |
| Analytics retention | 365 days |
| Priority support | ✅ |
| Custom domain | ✅ |
| Webhooks | ✅ |
| API access | ✅ |
| Post approval workflow | ✅ |
| Brand guidelines | ✅ |
| White label | ❌ |
| SLA | 99.9% uptime |

#### Cloud — Agency ($149/month or $1,490/year)
| Feature | Limit |
|---------|-------|
| Social accounts | 100 |
| Team members | Unlimited |
| Posts per month | Unlimited |
| AI generations/month | 10,000 |
| Analytics retention | 365 days |
| Dedicated support | ✅ |
| Custom domain | ✅ |
| Webhooks | ✅ |
| API access | ✅ |
| Post approval workflow | ✅ |
| Brand guidelines | ✅ |
| White label | ✅ |
| SLA | 99.99% uptime |

### Revenue Projections (Conservative)

| Month | Self-Hosted Users | Cloud Users | MRR |
|-------|-------------------|-------------|-----|
| 3 | 500 | 20 (15 free, 5 paid) | $95 |
| 6 | 2,000 | 100 (70 free, 30 paid) | $570 |
| 12 | 5,000 | 400 (280 free, 120 paid) | $2,280 |
| 24 | 15,000 | 1,200 (840 free, 360 paid) | $6,840 |

### Monetization Add-ons (Future)
| Add-on | Price |
|--------|-------|
| Extra AI generations (1000) | $5/month |
| Extra team members (10) | $10/month |
| Extra social accounts (10) | $5/month |
| Priority support | $25/month |
| Custom integrations | $50+/month |

---

## 7. UI/UX Wireframe Descriptions

### Design System
- **Color**: Deep purple (#6C5CE7) primary, slate gray neutral, green/red for status
- **Typography**: Inter for body, JetBrains Mono for code/data
- **Components**: shadcn/ui primitives, consistent 8px grid
- **Dark mode**: Full support via Tailwind dark mode

---

### Page 1: Dashboard (Home)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌────────┐                                                     │
│  │ Logo   │  Dashboard    Posts    Calendar    Analytics   Media │
│  └────────┘                                    👤 Avatar ▾     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Good morning, Liyuxuan 👋                    [+ New Post]     │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 📊 Posts     │ │ 📈 Reach     │ │ 💬 Engage    │           │
│  │   12 this wk │ │   2.4K       │ │   186        │           │
│  │   ↑ 20%      │ │   ↑ 15%      │ │   ↑ 8%       │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                 │
│  ┌─── Connected Accounts ──────────────────────────────────┐   │
│  │  🐦 Twitter @devliyuxuan   1.2K followers  ● Active     │   │
│  │  💼 LinkedIn /in/liyuxuan  890 followers   ● Active     │   │
│  │  📸 Instagram @liyuxuan    3.1K followers  ● Active     │   │
│  │  ➕ Connect Account                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Upcoming Posts ──────────────────────────────────────┐   │
│  │  📅 Jun 10, 2:00 PM  "Check out this new feature..."   │   │
│  │     → Twitter, LinkedIn  [Edit] [Duplicate] [Delete]   │   │
│  │  📅 Jun 11, 9:00 AM   "Weekly roundup of..."          │   │
│  │     → Twitter  [Edit] [Duplicate] [Delete]             │   │
│  │  📅 Jun 11, 4:00 PM   "Behind the scenes..."          │   │
│  │     → Instagram, Twitter  [Edit] [Duplicate] [Delete]  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Recent Performance ──────────────────────────────────┐   │
│  │  [Line chart: impressions over 7 days]                  │   │
│  │  [Bar chart: engagement by platform]                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key UX decisions:**
- Stats cards at top for quick health check
- Connected accounts with status indicators (green/red dot)
- Upcoming posts list with quick actions
- Performance charts at bottom for deeper insight
- Floating "New Post" button (FAB on mobile)

---

### Page 2: Post Composer

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard              New Post          [Save Draft]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Content ─────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  🎯 Platforms: [✓Twitter] [✓LinkedIn] [Instagram]      │   │
│  │                                                         │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │                                                   │  │   │
│  │  │  [B] [I] [U] [🔗] [📷] [📊] [😊]  | AI ✨ |     │  │   │
│  │  │                                                   │  │   │
│  │  │  Write your post here...                          │  │   │
│  │  │                                                   │  │   │
│  │  │  Use #hashtags and @mentions                     │  │   │
│  │  │                                                   │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  Characters: 142/280  │  Lines: 3  │  Links: 1         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Media ───────────────────────────────────────────────┐   │
│  │  [📎 Upload] [📁 Library]                               │   │
│  │                                                         │   │
│  │  ┌────┐ ┌────┐ ┌────┐                                  │   │
│  │  │ 🖼️ │ │ 🖼️ │ │ ➕ │                                  │   │
│  │  │ ✕  │ │ ✕  │ │    │                                  │   │
│  │  └────┘ └────┘ └────┘                                  │   │
│  │  Drag to reorder  │  Max 4 images per post              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Platform Preview ────────────────────────────────────┐   │
│  │  [Twitter] [LinkedIn] [Instagram]                        │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  ┌────┐                                        │    │   │
│  │  │  │ 🖼️ │  @devliyuxuan                          │    │   │
│  │  │  └────┘  Write your post here...               │    │   │
│  │  │          Use #hashtags and @mentions            │    │   │
│  │  │                                                 │    │   │
│  │  │  ❤️ 12  💬 3  🔁 5  📊 200                     │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Schedule ────────────────────────────────────────────┐   │
│  │  ○ Publish Now  ● Schedule for later                    │   │
│  │                                                         │   │
│  │  📅 Date: [Jun 10, 2026 ▾]  🕐 Time: [2:00 PM ▾]     │   │
│  │                                                         │   │
│  │  📌 Set as recurring: [No ▾]  Repeat: [Weekly ▾]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Tags ────────────────────────────────────────────────┐   │
│  │  [+ Add tag]  [marketing] [product-update] [+ AI tags] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────┐ ┌──────────────────────┐            │
│  │  💾 Save Draft       │ │  📅 Schedule Post    │            │
│  └──────────────────────┘ └──────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key UX decisions:**
- Platform selector at top — content adapts to selected platforms
- Rich text toolbar with formatting options
- Real-time character count per platform (Twitter 280, LinkedIn 3000)
- Live preview tab showing exactly how each platform renders
- AI button opens inline prompt for content generation
- Media upload with drag-and-drop and library browser
- Schedule options inline, no separate page needed

---

### Page 3: Content Calendar

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Dashboard          📅 Calendar                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ← June 2026 →      [Month] [Week] [Day]     [Today]          │
│                                                                 │
│  Filter: [All platforms ▾] [All statuses ▾] [All tags ▾]      │
│                                                                 │
│  ┌────┬────┬────┬────┬────┬────┬────┐                         │
│  │Mon │Tue │Wed │Thu │Fri │Sat │Sun │                         │
│  ├────┼────┼────┼────┼────┼────┼────┤                         │
│  │    │    │    │    │    │    │  1 │                         │
│  │    │    │    │    │    │    │    │                         │
│  ├────┼────┼────┼────┼────┼────┼────┤                         │
│  │  2 │  3 │  4 │  5 │  6 │  7 │  8 │                         │
│  │    │ 📝 │    │ 📝 │    │ 📝 │    │                         │
│  │    │ 9AM│    │2PM │    │10AM│    │                         │
│  ├────┼────┼────┼────┼────┼────┼────┤                         │
│  │  9 │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │                         │
│  │ 📝 │📝📝│    │ 📝 │    │ 📝 │    │                         │
│  │11AM│↑↑ │    │3PM │    │9AM │    │                         │
│  │    │today│   │    │    │    │    │                         │
│  └────┴────┴────┴────┴────┴────┴────┘                         │
│                                                                 │
│  Legend: 📝 Scheduled  📤 Published  ✏️ Draft  ❌ Failed        │
│                                                                 │
│  ┌─── Day Detail (Jun 10) ─────────────────────────────────┐   │
│  │  09:00 ── 📝 "Weekly tips..." ─── Twitter ✓            │   │
│  │  12:00 ── 📝 "Behind the scenes..." ─── Instagram 📷   │   │
│  │  15:00 ── 📤 "New feature announcement..." ─── All ✓    │   │
│  │                                                          │   │
│  │  [+ Add Post]  [Bulk Schedule]  [Import CSV]            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key UX decisions:**
- Month/Week/Day toggle views
- Color-coded by status (scheduled=blue, published=green, draft=gray, failed=red)
- Platform icons on each post card
- Click day to see detail panel
- Drag-and-drop to reschedule (month + week view)
- Drag-and-drop from sidebar drafts to calendar slot

---

### Page 4: Analytics

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Dashboard          📊 Analytics                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Period: [Last 7 days ▾]  Account: [All accounts ▾]           │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 👥 Followers │ │ 📈 Reach     │ │ 💬 Engage    │           │
│  │   12,450     │ │   24,300     │ │   1,860      │           │
│  │   ↑ 3.2%     │ │   ↑ 15.4%    │ │   ↑ 8.1%     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                 │
│  ┌─── Follower Growth ─────────────────────────────────────┐   │
│  │  [Area chart: followers over selected period]           │   │
│  │  Twitter: ──── LinkedIn: ──── Instagram: ────          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Best Posting Times ──────────────────────────────────┐   │
│  │  [Heatmap: engagement by hour × day]                    │   │
│  │  ████████░░░░░░  Mon                                    │   │
│  │  ░░████████░░░░  Tue                                    │   │
│  │  ░░░░████████░░  Wed                                    │   │
│  │  ░░████████░░░░  Thu                                    │   │
│  │  ████░░░░████░░  Fri                                    │   │
│  │  ░░░░████░░░░░░  Sat                                    │   │
│  │  ░░████░░░░░░░░  Sun                                    │   │
│  │  12AM 6AM 12PM 6PM 12AM                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Top Posts ───────────────────────────────────────────┐   │
│  │  #  Post Content          Platform  Engage  Reach       │   │
│  │  1  "New feature..."      Twitter   234     4,500       │   │
│  │  2  "Behind the scenes"   Instagram 189     3,200       │   │
│  │  3  "Weekly roundup"      LinkedIn  156     2,800       │   │
│  │  [View All →]                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Platform Breakdown ──────────────────────────────────┐   │
│  │  [Donut chart: engagement distribution by platform]     │   │
│  │  Twitter: 45%  LinkedIn: 30%  Instagram: 25%           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key UX decisions:**
- Date range picker with presets (7d, 30d, 90d, custom)
- Per-platform filtering
- Heatmap for best posting times — actionable insight
- Top posts table for content strategy learning
- Platform breakdown for resource allocation decisions
- Export to CSV/PDF button

---

### Page 5: Social Accounts Management

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Dashboard      🔗 Connected Accounts                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Twitter ─────────────────────────────────────────────┐   │
│  │  ┌────┐  @devliyuxuan                                   │   │
│  │  │ 🐦 │  Liyuxuan (@devliyuxuan)                       │   │
│  │  └────┘  1,234 followers  │  567 following              │   │
│  │          1,890 posts      │  Status: ● Active            │   │
│  │                                                         │   │
│  │  [📊 Analytics] [⚙️ Settings] [🔄 Refresh] [❌ Disconnect]│  │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── LinkedIn ────────────────────────────────────────────┐   │
│  │  ┌────┐  /in/liyuxuan                                   │   │
│  │  │ 💼 │  Liyuxuan - Developer                           │   │
│  │  └────┘  890 followers  │  450 connections              │   │
│  │          120 posts      │  Status: ● Active              │   │
│  │                                                         │   │
│  │  [📊 Analytics] [⚙️ Settings] [🔄 Refresh] [❌ Disconnect]│  │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Instagram ───────────────────────────────────────────┐   │
│  │  ┌────┐  @liyuxuan                                      │   │
│  │  │ 📸 │  Liyuxuan 📸                                    │   │
│  │  └────┘  3,100 followers  │  890 following               │   │
│  │          456 posts        │  Status: ● Active            │   │
│  │                                                         │   │
│  │  [📊 Analytics] [⚙️ Settings] [🔄 Refresh] [❌ Disconnect]│  │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Connect New Account ─────────────────────────────────┐   │
│  │                                                         │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │   │
│  │  │ 🐦 │ │ 💼 │ │ 📸 │ │ 🐋 │ │ 🦣 │                   │   │
│  │  │Twtr│ │Link│ │Inst│ │Blsk│ │Mast│                   │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘                   │   │
│  │                                                         │   │
│  │  Twitter  LinkedIn  Instagram  Bluesky  Mastodon       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key UX decisions:**
- Card-based layout per connected account
- Platform icon prominent for quick identification
- Key stats at a glance (followers, posts, status)
- Action buttons: Analytics, Settings, Refresh, Disconnect
- Connect new account section with platform grid
- OAuth flow opens in popup (not redirect) for smoother UX

---

### Page 6: Media Library

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Dashboard      📁 Media Library                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [📤 Upload]  [🔍 Search...]  [Filter: All ▾]                 │
│                                                                 │
│  ┌─── Grid View ───────────────────────────────────────────┐   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │   │
│  │  │      │ │      │ │      │ │      │ │      │        │   │
│  │  │  🖼️  │ │  🖼️  │ │  🖼️  │ │  🎥  │ │  🖼️  │        │   │
│  │  │      │ │      │ │      │ │      │ │      │        │   │
│  │  │1024x │ │ 800x │ │1200x │ │ 45s  │ │ 600x │        │   │
│  │  │ 768  │ │ 600  │ │ 900  │ │ MP4  │ │ 400  │        │   │
│  │  │      │ │      │ │      │ │      │ │      │        │   │
│  │  │ 2.1MB│ │ 890KB│ │ 1.5MB│ │ 12MB │ │ 340KB│        │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │   │
│  │                                                         │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │   │
│  │  │  🖼️  │ │  🖼️  │ │  🎥  │ │  🖼️  │ │  🖼️  │        │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Upload Area ─────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              📤 Drag & drop files here                   │   │
│  │              or click to browse                          │   │
│  │                                                         │   │
│  │         Supports: JPG, PNG, GIF, MP4, MOV              │   │
│  │         Max size: 50MB  │  Max 10 files at once        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Page 7: Settings

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Dashboard      ⚙️ Settings                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Profile] [Organization] [Team] [Billing] [API Keys] [Webhooks]│
│                                                                 │
│  ┌─── Profile Settings ────────────────────────────────────┐   │
│  │                                                         │   │
│  │  👤 Avatar                                              │   │
│  │  ┌────┐                                                 │   │
│  │  │    │  [Change Photo]                                 │   │
│  │  └────┘                                                 │   │
│  │                                                         │   │
│  │  Name:     [Liyuxuan                          ]        │   │
│  │  Email:    [liyuxuan@example.com              ]        │   │
│  │  Username: [@devliyuxuan                       ]        │   │
│  │  Bio:      [Building cool things 🚀           ]        │   │
│  │  Timezone: [Asia/Shanghai ▾]                           │   │
│  │  Language: [English ▾]                                  │   │
│  │                                                         │   │
│  │  [💾 Save Changes]                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Subscription ────────────────────────────────────────┐   │
│  │  Current Plan: Pro ($19/month)                          │   │
│  │  Renews: July 10, 2026                                  │   │
│  │                                                         │   │
│  │  [Change Plan]  [Cancel]  [Payment Method]              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── API Keys ────────────────────────────────────────────┐   │
│  │  Name          Prefix    Created    Last Used   [Revoke]│   │
│  │  Production    sf_a1b2   Jun 1      Jun 10      [❌]    │   │
│  │  Staging       sf_c3d4   May 15     Jun 8       [❌]    │   │
│  │                                                         │   │
│  │  [+ Generate New Key]                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Page 8: Login / Onboarding

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │    🚀 SocialForge    │                      │
│                    │                     │                      │
│                    │  Welcome back       │                      │
│                    │                     │                      │
│                    │  [Sign in with      │                      │
│                    │   Google]           │                      │
│                    │                     │                      │
│                    │  [Sign in with      │                      │
│                    │   GitHub]           │                      │
│                    │                     │                      │
│                    │  ─── or ───         │                      │
│                    │                     │                      │
│                    │  Email:             │                      │
│                    │  [_______________]  │                      │
│                    │  Password:          │                      │
│                    │  [_______________]  │                      │
│                    │                     │                      │
│                    │  [Login]            │                      │
│                    │                     │                      │
│                    │  Don't have an      │                      │
│                    │  account? [Sign up] │                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Onboarding flow (post-signup):**
```
Step 1: Choose plan (Free/Pro/Team)
Step 2: Connect first social account (OAuth popup)
Step 3: Create first post (guided)
Step 4: Schedule or publish
```

---

## Appendix A: File Structure

```
socialforge/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Test + lint
│       └── docker.yml          # Build + push Docker image
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Auth routes (login, register, etc.)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/             # Main app (protected)
│   │   ├── layout.tsx           # Sidebar + top nav
│   │   ├── page.tsx             # Dashboard home
│   │   ├── posts/
│   │   │   ├── page.tsx         # Post list
│   │   │   ├── new/page.tsx     # Post composer
│   │   │   └── [id]/page.tsx    # Post detail/edit
│   │   ├── calendar/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── media/page.tsx
│   │   ├── accounts/page.tsx
│   │   └── settings/
│   │       ├── page.tsx         # Profile
│   │       ├── organization/page.tsx
│   │       ├── team/page.tsx
│   │       ├── billing/page.tsx
│   │       └── api-keys/page.tsx
│   ├── api/                     # API routes
│   │   ├── auth/                # Auth.js routes
│   │   ├── v1/                  # REST API v1
│   │   │   ├── posts/
│   │   │   ├── social-accounts/
│   │   │   ├── analytics/
│   │   │   ├── media/
│   │   │   └── ai/
│   │   └── health/route.ts
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard-specific
│   ├── posts/                   # Post composer, list, etc.
│   ├── calendar/                # Calendar views
│   ├── analytics/               # Charts, metrics
│   ├── media/                   # Upload, library
│   ├── accounts/                # Social account cards
│   └── shared/                  # Shared components
├── lib/
│   ├── db/                      # Drizzle schema + migrations
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── migrations/
│   ├── auth.ts                  # Auth.js config
│   ├── redis.ts                 # Redis client
│   ├── s3.ts                    # MinIO/S3 client
│   ├── queue/                   # BullMQ setup
│   │   ├── index.ts
│   │   ├── post-publisher.ts
│   │   └── analytics-sync.ts
│   ├── platforms/               # Social platform integrations
│   │   ├── twitter.ts
│   │   ├── linkedin.ts
│   │   ├── facebook.ts
│   │   ├── bluesky.ts
│   │   └── mastodon.ts
│   ├── ai/                      # AI features
│   │   ├── generate.ts
│   │   └── repurpose.ts
│   └── utils/
│       ├── crypto.ts
│       ├── validators.ts
│       └── formatters.ts
├── worker/                      # BullMQ worker
│   └── index.ts
├── nginx/
│   └── nginx.conf
├── db/
│   └── init.sql
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.worker
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

## Appendix B: Key Technical Notes

### OAuth Token Refresh
All social platform tokens expire. The worker must:
1. Check `token_expires_at` before each post attempt
2. If expired, use refresh_token to get new access_token
3. Update `social_accounts` with new token
4. If refresh fails, mark account as `expired` and notify user

### Content Adaptation
When posting to multiple platforms, content must be adapted:
- **Twitter**: 280 char limit, no native images in threads
- **LinkedIn**: 3000 char, supports articles, professional tone
- **Instagram**: 2200 char, requires image/video, hashtag-heavy
- **Bluesky**: 300 char, supports images, AT Protocol
- **Mastodon**: 500 char, supports images, CW content warnings

### Rate Limiting Per Platform
| Platform | Limit | Reset |
|----------|-------|-------|
| Twitter API v2 | 50 tweets/15min | Rolling |
| LinkedIn | 100 posts/day | Daily |
| Facebook/IG | 25 posts/day/page | Daily |
| Bluesky | ~100 posts/hour | Rolling |
| Mastodon | Instance-dependent | Varies |

### Security Considerations
1. All OAuth tokens encrypted at rest (AES-256-GCM)
2. API keys hashed with bcrypt, only prefix stored in plaintext
3. CSRF protection on all forms
4. Rate limiting on all endpoints
5. Input sanitization (XSS prevention)
6. SQL injection prevention (Drizzle parameterized queries)
7. CORS configured for same-origin only
8. Content Security Policy headers

---

*Document version: 1.0*
*Author: Hermes Agent*
*Created: 2026-06-10*
