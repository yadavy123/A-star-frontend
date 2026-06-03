# Bug Report - Contact API Endpoints

**Date:** 03 June 2026  
**Project:** A* Classes Frontend  
**Reported by:** Frontend Debugging

---

## Issue 1: Admin Contact Subjects - GET endpoint missing

### Problem
`GET /api/admin/contact/subjects` returns **500** with error:  
`"Request method 'GET' is not supported"`

### Root Cause
Backend only supports `POST /api/admin/contact/subjects` (for creating subjects).  
There is **no GET endpoint** in the backend to list subjects under the admin path.

### Fix Applied (Frontend)
Changed `getAdminSubjects()` in `src/api/contactApi.ts` (line 91-103) to use the **public listing endpoint** instead:

| Before | After |
|---|---|
| `GET /api/admin/contact/subjects` | `GET /api/public/contact/subjects` |

### File Changed
- `src/api/contactApi.ts` — `getAdminSubjects()` function

---

## Issue 2: Admin Contact Subjects - Wrong URL path

### Problem
`POST /admin/api/contact/subjects` returns **500** with error:  
`"No static resource admin/api/contact/subjects"`

### Root Cause
The correct backend path pattern for admin endpoints is `/api/admin/contact/...`,  
not `/admin/api/contact/...` (which was used in the old JS API incorrectly).

### Fix Applied (Frontend)
Reverted all admin paths in `src/api/contactApi.ts` from `/admin/api/contact/...` back to `/api/admin/contact/...`.

### Endpoints Fixed

| Function | Method | Correct Path | Swagger Status |
|---|---|---|---|
| `createAdminSubject` | POST | `/api/admin/contact/subjects` | ✅ Exists |
| `deleteAdminSubject` | DELETE | `/api/admin/contact/subjects/{id}` | ✅ Exists |
| `getAdminMessages` | GET | `/api/admin/contact/messages` | ✅ Exists |
| `updateAdminMessageStatus` | PUT | `/api/admin/contact/messages/{id}/status` | ✅ Exists |
| `deleteAdminMessage` | DELETE | `/api/admin/contact/messages/{id}` | ✅ Exists |
| `getAdminSettings` | GET | `/api/admin/contact/settings` | ❌ Not in Swagger |
| `updateAdminSettings` | PUT | `/api/admin/contact/settings` | ❌ Not in Swagger |

---

## Issue 3: Contact Settings - Backend endpoint missing

### Problem
`GET /api/public/contact/settings` returns **500**.  
Also no admin settings endpoints (`/api/admin/contact/settings`) found in Swagger.

### Root Cause
The backend **does not have** contact settings endpoints at all.  
The Swagger spec shows settings only for Demo (boards/grades), not for Contact.

### Status
**No frontend fix possible.** Backend team needs to implement:
- `GET /api/public/contact/settings` — Public contact settings
- `GET /api/admin/contact/settings` — Admin get settings  
- `PUT /api/admin/contact/settings` — Admin update settings

---

## Swagger Reference

**URL:** `https://api.astarclasses.com/swagger-ui/index.html`  
**API Spec:** `https://api.astarclasses.com/v3/api-docs`

### Contact Endpoints Present in Swagger

| # | Method | Path | Description |
|---|---|---|---|
| 1 | GET | `/api/public/contact/subjects` | List active subjects (public) |
| 2 | POST | `/api/public/contact/message` | Submit contact form |
| 3 | POST | `/api/admin/contact/subjects` | Create subject |
| 4 | DELETE | `/api/admin/contact/subjects/{id}` | Delete subject |
| 5 | GET | `/api/admin/contact/messages` | List messages (paginated) |
| 6 | PUT | `/api/admin/contact/messages/{id}/status` | Update message status |
| 7 | DELETE | `/api/admin/contact/messages/{id}` | Delete message |

---

## Recommendations

1. **Backend:** Add `GET /api/admin/contact/subjects` endpoint for admin subject listing
2. **Backend:** Add Contact Settings endpoints (`GET/PUT /api/admin/contact/settings`, `GET /api/public/contact/settings`)
3. **Frontend (old JS API):** Update `src/api/api/contactApi.js` admin paths from `/admin/api/contact/...` to `/api/admin/contact/...` to match Swagger
