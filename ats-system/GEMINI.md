# Project: Velocity ATS - System Memory

### 📧 Email Design & Structure (LOCKED)
- **Visual Identity:** All system-generated emails must use the minimalist white header with the 6px top accent bar (#2b7dfb for standard, #f59e0b for rescheduling, #ef4444 for cancellations).
- **Logo:** Use `Logo.png` with a fixed height of `65px` and `15px` vertical padding.
- **Subject Line Format:** Every email subject MUST follow the pattern: `"{Content} | {{candidate_name}}"`. This is a non-negotiable structural requirement.
- **Early Arrival:** All interview-related emails must include the formal 15-minute early arrival note.
- **Signatures:** Enable `addSignature: true` for all templates to include the sender's personalized signature.
- **Standard Layout:** Use the unified `getLayout` logic from `update_all_email_templates.ts` to ensure consistency. Do not deviate from the card-based shadow design.

### 🚀 Connection & Port Defaults
- **Backend:** [http://localhost:4000](http://localhost:4000)
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Database:** PostgreSQL on Port 5432

## 🛠️ Critical Architectural Decisions
1. **Candidate Merging:**
   - **Manual Entry:** Detects duplicates; "Merge" only populates empty fields. Never overwrites existing data.
   - **Self-Registration:** Automatically updates empty fields and creates a new application for the linked `jobId`.
2. **Interview Management:**
   - Interviews are structured with `date` (start) and `endTime`.
   - Evaluation requires mandatory **Primary Reason** and **Sub-reason** before submission.
   - All evaluation data is mirrored in the "Ratings Summary" (Reviews) tab.
3. **Permissions System:**
   - Permissions are stored in a structured JSON field in the `User` model.
   - Levels: `canUse`, `canEdit`, `canManageSettings` per module.
   - `globalSettingsAccess` toggle controls visibility of the entire Settings section.
4. **Form Logic:**
   - **Education/Experience Duration:** Always use separate `fromMonth`, `fromYear`, `toMonth`, `toYear` fields. No combined strings.

## 📋 Data Persistence Rules
- **Dropdown Master Lists:** (Departments, Technologies, Interview Levels, Statuses, Sources) MUST be stored in the `Company` model columns with `@default` values in Prisma to survive system resets.
- **Activity Logging:** Every creation or update MUST capture the `userId` of the recruiter performing the action.

## 📂 Key File Locations
- **Manual Form:** `ats-frontend/src/app/(dashboard)/candidates/new/page.tsx`
- **Candidate Profile:** `ats-frontend/src/app/(dashboard)/candidates/[id]/page.tsx`
- **Permissions Management:** `ats-frontend/src/app/(dashboard)/settings/users/page.tsx`
- **Sidebar Logic:** `ats-frontend/src/components/Sidebar.tsx`
