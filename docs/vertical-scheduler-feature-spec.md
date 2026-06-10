# Vertical Scheduler — Feature Specification

> **Date**: 2026-06-10
> **Based on**: tool-research-report.md (V62)
> **Status**: Ready for development
> **Target**: Next.js SaaS (monorepo: cc-business/vertical-scheduler)

---

## 1. Executive Summary

A vertical-positioned scheduling/booking tool targeting specific industries (designers, fitness coaches, real estate agents). Unlike Calendly/Cal.com which serve everyone, this tool focuses on one niche with industry-specific features.

**Core Value Proposition**: "Book appointments that fit your industry — not generic scheduling."

**Target Users**:
- Freelance designers needing client booking
- Fitness coaches scheduling sessions
- Consultants/coaches with package-based pricing

---

## 2. Feature Breakdown by Priority

### P0 — MVP (Must-Have for Launch)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Booking Page Builder** | Visual drag-and-drop booking page with custom branding |
| 2 | **Calendar Integration** | Google Calendar sync (two-way) |
| 3 | **Availability Management** | Set available hours, buffer time, max bookings/day |
| 4 | **Booking Confirmation** | Email confirmation + calendar invite |
| 5 | **Payment Integration** | Collect deposit/full payment via Pancake at booking time |
| 6 | **Multi-language** | EN/PT/ES/JA/KO support from day one |

### P1 — Important (Phase 2)

| # | Feature | Description |
|---|---------|-------------|
| 7 | **Package Pricing** | Create service packages (e.g., "5 sessions for $200") |
| 8 | **Recurring Bookings** | Weekly/monthly recurring appointments |
| 9 | **SMS/WhatsApp Reminders** | Automated reminders 24h before |
| 10 | **Client Database** | Track client history, notes, preferences |

### P2 — Nice-to-Have (Phase 3)

| # | Feature | Description |
|---|---------|-------------|
| 11 | **Team Scheduling** | Multiple staff members with individual calendars |
| 12 | **Analytics Dashboard** | Booking trends, revenue, popular times |
| 13 | **Custom Domain** | White-label booking pages |
| 14 | **API Access** | REST API for integrations |

---

## 3. Architecture Decisions

### Tech Stack
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Frontend | Next.js 15 + Tailwind | Already proven in devtools-hub |
| Database | Turso (libsql) | Serverless-friendly, same as devtools-hub |
| Auth | NextAuth.js + Google OAuth | Same pattern as devtools-hub |
| Payments | Waffo Pancake | Shared merchant with existing products |
| Calendar | Google Calendar API | Free, widely used |
| Email | Resend or SendGrid | Transactional emails |
| Deployment | Vercel | Same as devtools-hub |

### Database Schema (Core)

```sql
-- Users (shared with devtools-hub via NextAuth)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Booking Pages
CREATE TABLE booking_pages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand_color TEXT DEFAULT '#07c160',
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Services
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES booking_pages(id)
);

-- Availability Rules
CREATE TABLE availability (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TEXT NOT NULL, -- "09:00"
  end_time TEXT NOT NULL, -- "17:00"
  FOREIGN KEY (page_id) REFERENCES booking_pages(id)
);

-- Bookings
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES booking_pages(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Payments
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  pancake_order_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```

### File Structure

```
vertical-scheduler/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard overview
│   │   │   ├── bookings/page.tsx # Manage bookings
│   │   │   ├── pages/page.tsx    # Manage booking pages
│   │   │   ├── services/page.tsx # Manage services
│   │   │   └── settings/page.tsx # Account settings
│   │   └── book/
│   │       └── [slug]/
│   │           └── page.tsx      # Public booking page
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── bookings/route.ts
│   │   ├── pages/route.ts
│   │   ├── services/route.ts
│   │   └── webhooks/pancake/route.ts
│   └── layout.tsx
├── components/
│   ├── BookingPageBuilder.tsx
│   ├── CalendarPicker.tsx
│   ├── TimeSlotPicker.tsx
│   └── PaymentForm.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── google-calendar.ts
│   └── email.ts
├── messages/
│   ├── en.json
│   ├── pt.json
│   ├── es.json
│   ├── ja.json
│   └── ko.json
└── tests/
    ├── booking-flow.spec.ts
    ├── calendar-sync.spec.ts
    └── payment.spec.ts
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Project setup (Next.js 15 + Turso + NextAuth)
2. Database schema + migrations
3. Authentication (Google OAuth)
4. Dashboard layout
5. Booking page CRUD

### Phase 2: Core Features (Week 3-4)
1. Availability management
2. Service management
3. Public booking page
4. Time slot selection
5. Booking confirmation emails

### Phase 3: Calendar & Payments (Week 5-6)
1. Google Calendar integration
2. Pancake payment integration
3. Package pricing
4. Recurring bookings

### Phase 4: Polish & Launch (Week 7-8)
1. i18n (5 languages)
2. Mobile responsive
3. SEO optimization
4. Landing page
5. Beta testing

---

## 5. Revenue Model

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 1 booking page, 3 services, 10 bookings/month |
| Pro | $10/month | Unlimited pages/services, calendar sync, payments |
| Business | $25/month | Team scheduling, analytics, custom domain, API |

**Projections (conservative)**:
- Month 3: 500 users, 5% conversion = $250 MRR
- Month 6: 2,000 users, 5% conversion = $1,000 MRR
- Month 12: 10,000 users, 8% conversion = $8,000 MRR

---

## 6. Competitive Analysis

| Feature | Calendly | Cal.com | SavvyCal | **Vertical Scheduler** |
|---------|----------|---------|----------|----------------------|
| Generic scheduling | ✅ | ✅ | ✅ | ❌ |
| Industry-specific | ❌ | ❌ | ❌ | ✅ |
| Package pricing | ❌ | ❌ | ❌ | ✅ |
| Multi-language | Limited | Limited | ❌ | ✅ (5 langs) |
| Free tier | ✅ | ✅ | ❌ | ✅ |
| Self-host option | ❌ | ✅ | ❌ | ❌ |
| Price | $10-16/mo | $12-28/mo | $10-17/mo | $10-25/mo |

**Key Differentiator**: Industry-specific features (package pricing, service templates for designers/fitness/consultants) that generic tools don't offer.

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Google Calendar API quota | Medium | High | Implement rate limiting, cache sync |
| Low initial adoption | High | Medium | Focus on one niche (designers), content marketing |
| Payment integration complexity | Medium | Medium | Start with Pancake, add Stripe later |
| Calendar sync conflicts | Medium | High | Two-way sync with conflict detection |

---

**File Version**: V1.0 (2026-06-10)
**Status**: ✅ Ready for development
**Next Step**: Start Phase 1 with CC in tmux cc-web
