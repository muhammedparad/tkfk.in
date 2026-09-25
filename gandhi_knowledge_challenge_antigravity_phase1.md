# Gandhi Knowledge Challenge 2026
## Antigravity Build Specification — Phase 1

**Project type:** Production-ready registration and participant portal  
**Target launch:** Registration website urgently, before quiz module  
**Event date:** 2 October 2026  
**Prize headline:** ₹9,999 First Prize  
**Registration fee:** ₹99 — payment implementation must only be connected through an authorized, compliant payment arrangement approved for the event  
**Quiz module:** Phase 2; do NOT build the actual quiz-taking interface in Phase 1

---

# 1. PRIMARY OBJECTIVE

Build a clean, trustworthy, mobile-first website for the **Gandhi Knowledge Challenge 2026**.

The Phase 1 website must allow a participant to:

1. Discover the event.
2. Read basic event information.
3. Register with basic details.
4. Complete the authorized payment/registration process.
5. Receive a unique participant ID after confirmed registration.
6. Log in to a participant dashboard.
7. Access study material.
8. Join the official WhatsApp updates group.
9. Read rules, FAQ, privacy, refund, and contact information.
10. See that quiz access will be added later.

The administrators must be able to:

1. Log into an admin dashboard.
2. View registration statistics.
3. Search and filter participants.
4. View registration/payment status.
5. View referral-code performance.
6. Export participant data.
7. Manually review exceptional registrations.
8. Maintain an audit trail.

DO NOT build the actual quiz-taking system yet.

---

# 2. IMPORTANT IMPLEMENTATION BOUNDARIES

## Payment

Create a clean payment-service abstraction/interface, but do not hard-code a particular payment provider.

The system must distinguish:

- `PAYMENT_PENDING`
- `PAYMENT_SUCCESS`
- `PAYMENT_FAILED`
- `PAYMENT_REFUNDED`
- `PAYMENT_MANUAL_REVIEW`

A browser redirect or a participant clicking “I have paid” must NEVER by itself mark a registration as paid.

The production payment adapter must only mark a registration successful after trusted server-side confirmation from the authorized payment system.

Keep all provider-specific code isolated so the payment provider can be connected later without changing the registration UI.

Do not expose payment-provider secret keys in frontend code.

## Quiz

Do not implement:

- Quiz questions
- Quiz timer
- Quiz attempt creation
- Answer submission
- Scoring
- Leaderboard
- Winner calculation

Create only a placeholder card saying that quiz access will become available on the scheduled date.

---

# 3. RECOMMENDED TECH STACK

Use:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Auth
- PostgreSQL
- Server-side API routes/server actions
- Responsive mobile-first UI

Keep dependencies minimal.

Prefer native browser functionality and existing framework capabilities over unnecessary libraries.

---

# 4. VISUAL DIRECTION

The website should feel:

- Professional
- Academic
- Trustworthy
- Modern
- Minimal
- Appropriate for Gandhi Jayanti
- Suitable for a nationwide student audience

Avoid:

- Excessive animations
- Overly decorative patriotic graphics
- Crowded hero sections
- Huge paragraphs
- Generic corporate templates
- Dark/heavy UI
- Excessive gradients

Use a restrained visual system.

Suggested palette:

- Off-white / warm background
- Charcoal text
- Muted saffron accent
- Muted green accent
- Neutral borders
- White cards

Do not make the site look like a political campaign.

---

# 5. ROUTES

Create these routes:

```text
/
 /register
 /registration-status
 /payment
 /registration-success
 /login
 /dashboard
 /study
 /rules
 /faq
 /privacy
 /terms
 /refund
 /contact

 /admin/login
 /admin/dashboard
 /admin/participants
 /admin/referrals
 /admin/settings
```

Future Phase 2 routes:

```text
/quiz-rules
/quiz
/quiz-completed
/results
/leaderboard
```

Do not implement those Phase 2 routes yet.

---

# 6. LANDING PAGE

## Hero

Display:

```text
GANDHI JAYANTI 2026

THE GANDHI KNOWLEDGE CHALLENGE

Test your knowledge.
Learn. Compete. Celebrate Gandhi Jayanti.

2 OCTOBER 2026

₹9,999
FIRST PRIZE

[ REGISTER NOW ]
```

Below the primary CTA, show:

```text
50 Questions
25 Minutes
Online
```

These are event details and should be easy to change from a central configuration file.

---

# 7. LANDING PAGE SECTIONS

## Section A — About

Short explanation:

> Gandhi Knowledge Challenge 2026 is an online knowledge competition conducted on the occasion of Gandhi Jayanti, covering Gandhi's life, ideas, movements, historical context and legacy.

Keep the copy concise.

## Section B — Event Highlights

Cards:

- Online participation
- 2 October 2026
- 50 questions
- 25-minute quiz
- ₹9,999 first prize
- Participant study material

## Section C — How It Works

```text
01 Register
02 Complete registration
03 Receive participant ID
04 Study the provided material
05 Attend the online quiz on 2 October
06 Results and verification
```

Do not imply quiz access is available before the scheduled date.

## Section D — Important Dates

Registration opening:
Use configurable value.

Registration closing:
Use configurable value.

Quiz:
2 October 2026.

Results:
Use configurable value.

## Section E — FAQ preview

Show 4–6 questions and link to `/faq`.

## Section F — Final CTA

```text
Ready to take the challenge?

[ REGISTER NOW ]
```

## Footer

Include:

- Event name
- Organiser information
- Contact
- Rules
- Terms
- Privacy
- Refund policy
- Copyright year

Do not hide the identity of the responsible organiser.

---

# 8. REGISTRATION PAGE

Route:

`/register`

Form fields:

### Required

- Full name
- Email
- Mobile number
- State

### Recommended

- College / Institution
- City

### Optional

- Referral code

Do not collect unnecessary personal information.

---

# 9. FORM VALIDATION

Client-side validation:

- Name cannot be empty.
- Email must have valid format.
- Phone must have valid format.
- State must be selected.
- Trim whitespace.
- Normalize email to lowercase.
- Normalize phone consistently.
- Referral code should be normalized to uppercase.

Server-side validation is mandatory even if client-side validation exists.

Never trust client-side validation.

---

# 10. REGISTRATION FLOW

Use this flow:

```text
Visitor
  ↓
Registration form
  ↓
Server validates details
  ↓
Create registration record
  ↓
PAYMENT_PENDING
  ↓
Authorized payment flow
  ↓
Trusted server-side confirmation
  ↓
PAYMENT_SUCCESS
  ↓
Generate participant ID
  ↓
REGISTRATION_CONFIRMED
  ↓
Activate participant account
  ↓
Show dashboard
```

If payment fails:

```text
PAYMENT_FAILED
  ↓
Allow retry
```

If payment needs investigation:

```text
PAYMENT_MANUAL_REVIEW
  ↓
Admin reviews
```

---

# 11. PARTICIPANT ID

Generate a unique participant ID only after the registration is confirmed.

Format:

```text
TKFK26-XXXXXX
```

Example:

```text
TKFK26-004821
```

Requirements:

- Must be unique.
- Must not expose sequential database IDs.
- Must be generated server-side.
- Must not be editable by the participant.

Do not use the participant ID as the sole authentication factor.

---

# 12. PARTICIPANT LOGIN

Use secure authentication.

Recommended:

- Email + password, or
- Magic link/OTP if supported by the chosen authentication setup.

Do not create a custom password storage system.

Participants should be able to:

- Log in
- Log out
- Reset/recover access
- View their dashboard

---

# 13. PARTICIPANT DASHBOARD

Route:

`/dashboard`

Design:

```text
TKFK GANDHI KNOWLEDGE CHALLENGE

Welcome, {participantName}

Participant ID
TKFK26-004821

Registration
✓ CONFIRMED

--------------------------------

STUDY MATERIAL
Prepare for the challenge
[ OPEN STUDY MATERIAL ]

--------------------------------

QUIZ
2 October 2026

Quiz access will be available
on the scheduled date.

[ QUIZ COMING SOON ]

--------------------------------

WHATSAPP UPDATES
Join the official event updates group.

[ JOIN WHATSAPP GROUP ]
```

The WhatsApp URL must come from configuration, not be hard-coded throughout components.

---

# 14. STUDY MATERIAL

Route:

`/study`

Use a clean module list.

Initial modules:

```text
01 — Gandhi's Early Life
02 — South Africa
03 — Return to India
04 — Non-Cooperation Movement
05 — Salt March
06 — Quit India Movement
07 — Gandhi's Philosophy
08 — Important Dates
09 — Important Personalities
10 — Gandhi's Legacy
```

Each module should support:

- Title
- Short description
- Body content
- Optional image
- Optional PDF/download
- Last updated date

For Phase 1, content can be stored in static markdown/JSON or a simple database table.

Do not build a complex LMS.

---

# 15. PAYMENT PAGE

Route:

`/payment`

This page should be designed as an integration shell.

Display:

```text
Registration

Participant:
{participant name}

Registration fee:
₹99

Payment status:
PENDING

[ PROCEED TO PAYMENT ]
```

Production payment integration must be implemented only through the authorized payment arrangement.

The frontend must never decide that a payment succeeded.

Expected state transitions:

```text
PENDING
SUCCESS
FAILED
REFUNDED
MANUAL_REVIEW
```

The backend should store:

- Internal registration ID
- Payment status
- Provider reference (when available)
- Amount
- Currency
- Timestamp
- Verification timestamp
- Provider response metadata needed for reconciliation

Never store sensitive card/payment credentials.

---

# 16. REGISTRATION SUCCESS PAGE

Route:

`/registration-success`

Display:

```text
REGISTRATION CONFIRMED

Welcome to TKFK Gandhi Knowledge Challenge 2026.

Participant ID

TKFK26-004821

Your registration has been confirmed.

[ GO TO DASHBOARD ]

[ JOIN WHATSAPP GROUP ]
```

Do not display unnecessary payment details publicly.

---

# 17. REGISTRATION STATUS PAGE

Route:

`/registration-status`

Useful for participants who return later.

Display status:

```text
Registration:
CONFIRMED

Participant ID:
TKFK26-004821
```

For pending cases:

```text
Registration:
PAYMENT PENDING

Your registration is not confirmed yet.
```

Do not allow users to manipulate status from the browser.

---

# 18. REFERRAL SYSTEM

Registration contains:

```text
Do you have a referral code?
[ OPTIONAL ]
```

Referral codes should be normalized.

Database should associate:

```text
participant → referral_code
```

Admin should see:

```text
Referral Code | Confirmed Registrations
TKFK-A81F     | 83
TKFK-7C22     | 71
TKFK-B91D     | 64
```

Do not publicly expose participant personal information.

Referral analytics should count only the registration state defined by the organiser, preferably confirmed registrations rather than abandoned forms.

---

# 19. DATABASE

Use PostgreSQL through Supabase.

## participants

```text
id UUID PRIMARY KEY
participant_id TEXT UNIQUE NOT NULL
auth_user_id UUID UNIQUE
name TEXT NOT NULL
email TEXT NOT NULL
phone TEXT NOT NULL
college TEXT
state TEXT NOT NULL
city TEXT
referral_code TEXT
status TEXT NOT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Suggested participant statuses:

```text
ACTIVE
BLOCKED
CANCELLED
```

## registrations

```text
id UUID PRIMARY KEY
participant_id UUID REFERENCES participants(id)
registration_status TEXT NOT NULL
payment_status TEXT NOT NULL
payment_reference TEXT
amount INTEGER
currency TEXT DEFAULT 'INR'
confirmed_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## referral_codes

```text
id UUID PRIMARY KEY
code TEXT UNIQUE NOT NULL
active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ
```

## study_modules

```text
id UUID PRIMARY KEY
title TEXT NOT NULL
slug TEXT UNIQUE NOT NULL
description TEXT
content TEXT
sort_order INTEGER
published BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## announcements

```text
id UUID PRIMARY KEY
title TEXT NOT NULL
body TEXT NOT NULL
published BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## audit_logs

```text
id UUID PRIMARY KEY
admin_user_id UUID
action TEXT NOT NULL
entity_type TEXT
entity_id TEXT
metadata JSONB
created_at TIMESTAMPTZ
```

---

# 20. FUTURE TABLES — DO NOT BUILD YET

Reserve the architecture for:

```text
questions
quiz_sessions
quiz_answers
quiz_results
certificates
```

Do not implement these now.

---

# 21. ADMIN DASHBOARD

Route:

`/admin/dashboard`

Show:

```text
TOTAL REGISTRATIONS
CONFIRMED
PAYMENT PENDING
PAYMENT FAILED
MANUAL REVIEW
```

Also:

```text
REGISTRATIONS TODAY
REGISTRATIONS THIS WEEK
TOP REFERRAL CODES
```

Do not expose financial or personal information to ordinary participants.

---

# 22. ADMIN PARTICIPANTS

Route:

`/admin/participants`

Columns:

```text
Participant ID
Name
Email
Phone
College
State
Referral
Registration Status
Payment Status
Registered At
```

Features:

- Search
- Filter by state
- Filter by registration status
- Filter by payment status
- Filter by referral code
- Pagination
- Export CSV

Do not load thousands of rows into the browser at once.

---

# 23. ADMIN REFERRALS

Route:

`/admin/referrals`

Show:

```text
Code
Total Uses
Confirmed Registrations
Pending
Conversion
```

Add date filtering.

---

# 24. SECURITY

Mandatory:

- HTTPS in production
- Supabase Row Level Security
- Server-side authorization
- Admin role separation
- Input validation
- Rate limiting where appropriate
- CAPTCHA/anti-bot protection on public registration if needed
- Secure authentication
- No secret keys in client code
- No service-role key in frontend
- Audit logs for administrative changes
- Database backups
- Error logging without exposing sensitive information

Participants must only be able to access their own data.

Admins must be explicitly authorized.

---

# 25. PRIVACY

The site collects personal data.

Create a clear privacy page covering:

- What information is collected
- Why it is collected
- How it is used
- Who can access it
- How long it is retained
- Contact for privacy questions
- Event communications
- Third-party services where applicable

Do not collect information that is not necessary for the event.

---

# 26. RESPONSIVE DESIGN

Mobile is the priority.

Test at:

```text
360px
390px
412px
768px
1024px
1440px
```

Registration must be comfortable on a phone.

Buttons should be large enough for touch.

Do not make users zoom.

---

# 27. PERFORMANCE

The landing page should load quickly.

Requirements:

- Optimize images
- Lazy-load noncritical images
- Avoid huge JavaScript bundles
- Use server rendering where useful
- Use compressed assets
- Avoid unnecessary animation libraries
- Keep landing page dependencies minimal

---

# 28. ERROR STATES

Every important action needs:

### Loading

```text
Processing...
```

### Success

```text
Registration confirmed.
```

### Error

```text
Something went wrong.
Please try again.
```

### Network failure

```text
We couldn't connect to the server.
Please check your connection and try again.
```

Do not expose raw database/API errors to participants.

---

# 29. EMPTY STATES

Admin:

```text
No participants found.
```

Study:

```text
Study material will be available soon.
```

Announcements:

```text
No announcements yet.
```

---

# 30. CONFIGURATION

Create a single configuration file for:

```text
EVENT_NAME
EVENT_DATE
REGISTRATION_FEE
FIRST_PRIZE
WHATSAPP_GROUP_URL
CONTACT_EMAIL
CONTACT_PHONE
REGISTRATION_OPEN
REGISTRATION_CLOSE
```

Do not scatter these values across components.

Example:

```ts
export const eventConfig = {
  name: "Gandhi Knowledge Challenge 2026",
  date: "2026-10-02",
  registrationFee: 99,
  firstPrize: 9999,
  whatsappGroupUrl: "...",
  contactEmail: "...",
};
```

Payment integration credentials must NOT be placed in this public configuration object.

---

# 31. COMPONENT STRUCTURE

Use reusable components:

```text
components/
  Navbar
  Footer
  Hero
  EventStats
  EventHighlights
  HowItWorks
  FAQPreview
  RegistrationForm
  PaymentStatusCard
  ParticipantCard
  StudyModuleCard
  AnnouncementCard
  StatusBadge
  AdminSidebar
  AdminStatsCard
  ParticipantTable
  ReferralTable
  LoadingState
  ErrorState
  EmptyState
```

---

# 32. FOLDER STRUCTURE

Use:

```text
app/
  page.tsx
  register/
    page.tsx
  payment/
    page.tsx
  registration-status/
    page.tsx
  registration-success/
    page.tsx
  login/
    page.tsx
  dashboard/
    page.tsx
  study/
    page.tsx
  rules/
    page.tsx
  faq/
    page.tsx
  privacy/
    page.tsx
  terms/
    page.tsx
  refund/
    page.tsx
  contact/
    page.tsx

  admin/
    login/
      page.tsx
    dashboard/
      page.tsx
    participants/
      page.tsx
    referrals/
      page.tsx
    settings/
      page.tsx

components/
lib/
  supabase/
  auth/
  registration/
  payment/
  referrals/
  validation/
types/
config/
public/
supabase/
  migrations/
```

---

# 33. PAYMENT SERVICE ABSTRACTION

Create an interface such as:

```ts
interface PaymentService {
  createPaymentRequest(input: CreatePaymentInput): Promise<PaymentRequest>;
  getPaymentStatus(reference: string): Promise<PaymentStatus>;
  verifyPayment(reference: string): Promise<VerifiedPayment>;
}
```

Do not implement provider-specific behavior inside registration components.

Registration should call:

```text
registration service
      ↓
payment service
      ↓
provider adapter
```

This allows the payment provider to be replaced later.

---

# 34. CRITICAL PAYMENT RULE

Never do:

```ts
if (userReturnedFromPayment) {
  registration.status = "CONFIRMED";
}
```

Instead:

```text
Payment provider
      ↓
Trusted server notification / verification
      ↓
Backend verifies:
  - reference
  - amount
  - status
  - registration
  - duplicate processing
      ↓
Database updated
      ↓
Participant activated
```

The exact provider integration must be supplied by the authorized payment provider/event administration.

---

# 35. ADMIN AUTHORIZATION

Use a server-side admin role.

Never use:

```text
if (email === "admin@gmail.com")
```

for production authorization.

Use an explicit admin role/table and enforce it server-side.

---

# 36. TEST DATA

Create development seed data:

```text
Participant:
Test User

Participant ID:
TKFK26-TEST01

Status:
CONFIRMED
```

Also create:

```text
PAYMENT_PENDING
PAYMENT_FAILED
MANUAL_REVIEW
```

test records.

Do not use real participant data during development.

---

# 37. ACCEPTANCE CRITERIA

Phase 1 is complete only when:

- Landing page works.
- Registration form works.
- Validation works.
- Participant record is created server-side.
- Duplicate email/phone handling works.
- Referral code is recorded.
- Registration status works.
- Payment integration shell works.
- Confirmed registration can receive a unique participant ID.
- Participant can authenticate.
- Participant sees only their own dashboard.
- Study material works.
- WhatsApp link works.
- Admin login works.
- Admin can view participants.
- Admin can search participants.
- Admin can filter participants.
- Admin can view registration/payment states.
- Referral statistics work.
- Mobile layout works.
- No secrets are exposed in frontend code.
- RLS is enabled.
- Production build succeeds.

---

# 38. ANTIGRAVITY EXECUTION INSTRUCTIONS

Do NOT attempt to build the entire application in one giant operation.

Work in milestones.

## Milestone 1 — Foundation

First:

1. Inspect the repository.
2. Create/verify Next.js + TypeScript setup.
3. Install only necessary dependencies.
4. Configure Supabase.
5. Create environment variable template.
6. Create database migrations.
7. Configure authentication.
8. Create base layout and design system.

STOP and verify the application builds.

## Milestone 2 — Public Website

Build:

- Landing
- About
- How it works
- Event highlights
- FAQ
- Footer
- Rules
- Privacy
- Terms
- Refund
- Contact

Verify mobile responsiveness.

## Milestone 3 — Registration

Build:

- Registration form
- Validation
- Server-side registration
- Referral code handling
- Duplicate prevention
- Registration states

Test with seed users.

## Milestone 4 — Participant Account

Build:

- Login
- Dashboard
- Participant ID
- Study material
- WhatsApp button
- Quiz placeholder

Test access control.

## Milestone 5 — Admin

Build:

- Admin login
- Dashboard statistics
- Participant table
- Search
- Filters
- Referral analytics
- CSV export
- Audit logs

## Milestone 6 — Payment Integration Boundary

Do NOT invent provider APIs.

Create:

- Payment service interface
- Payment status model
- Pending/success/failed/manual review states
- Server-side verification boundary
- Reconciliation-ready database fields

Only connect a real provider after the authorized provider documentation and event administration requirements are available.

## Milestone 7 — Final QA

Test:

- Registration
- Duplicate registration
- Invalid email
- Invalid phone
- Invalid referral
- Login
- Logout
- Dashboard access
- Unauthorized dashboard access
- Admin access
- Mobile layout
- Database security
- Production build

---

# 39. ANTIGRAVITY BEHAVIOR RULES

When working on this project:

1. Do not rewrite working components unnecessarily.
2. Do not introduce a large dependency for a small feature.
3. Do not hard-code event information in multiple files.
4. Do not expose secrets.
5. Do not trust client-side status.
6. Do not skip server-side validation.
7. Do not bypass authentication.
8. Do not disable security rules to make a feature work.
9. Do not fabricate payment-provider APIs.
10. Do not build the quiz module during Phase 1.
11. Keep commits/changes logically grouped.
12. After each milestone, run the build and relevant tests.
13. Fix errors before proceeding to the next milestone.
14. Prefer simple, maintainable code over clever abstractions.
15. Keep the UI mobile-first.

---

# 40. FINAL PHASE 1 USER JOURNEY

The complete participant journey should be:

```text
Instagram / WhatsApp / College
            ↓
       Landing Page
            ↓
       REGISTER NOW
            ↓
       Registration
            ↓
       Payment step
            ↓
   Trusted confirmation
            ↓
   Registration Confirmed
            ↓
     Participant ID
            ↓
        Dashboard
       /     |      \
      /      |       \
 Study   Quiz Info   WhatsApp
 Material            Updates
            ↓
     2 October 2026
            ↓
       QUIZ MODULE
       (PHASE 2)
```

---

# 41. PHASE 2 — FUTURE QUIZ

When Phase 1 is stable, build:

```text
Quiz Rules
    ↓
Start Quiz
    ↓
Create Quiz Session
    ↓
Server-side Start Time
    ↓
50 Questions
    ↓
Auto-save Answers
    ↓
Server-side Expiry
    ↓
Submit
    ↓
Server-side Scoring
    ↓
Result Verification
    ↓
Leaderboard
```

Do not implement this until the registration system is stable.

---

# 42. FIRST PRIORITY

If time is extremely limited, prioritize exactly this:

```text
1. Landing page
2. Registration
3. Supabase database
4. Participant ID
5. Login
6. Dashboard
7. Study material
8. WhatsApp link
9. Admin participant list
10. Payment integration boundary
```

Do not spend time tomorrow on:

- Advanced animations
- Complex certificates
- Full leaderboard
- Quiz engine
- Advanced analytics
- Dark mode
- Multiple themes
- Fancy referral leaderboards
- Complex notification systems

A simple working registration platform is more valuable than a beautiful incomplete platform.

---

# 43. DEFINITION OF DONE

The Phase 1 website is ready for public registration when a real test participant can:

```text
Open link
  ↓
Understand event
  ↓
Register
  ↓
Complete authorized registration/payment flow
  ↓
Receive confirmation
  ↓
Receive participant ID
  ↓
Log in
  ↓
Open dashboard
  ↓
Read study material
  ↓
Join WhatsApp updates
```

and an administrator can:

```text
Log in
  ↓
See registration
  ↓
Find participant
  ↓
Check status
  ↓
See referral
  ↓
Export data
```

---

## END OF PHASE 1 SPECIFICATION
