# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-workflow.spec.ts >> Velocity ATS Core Workflow >> Full Journey: Login -> Job -> Walkin -> Candidate -> Pipeline -> Slot
- Location: e2e\core-workflow.spec.ts:5:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*jobs/
Received string:  "http://localhost:3000/dashboard"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/dashboard"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - img "Velocity" [ref=e7] [cursor=pointer]
        - generic [ref=e9]:
          - generic [ref=e10]: A
          - generic [ref=e11]: T
          - generic [ref=e12]: S
      - navigation [ref=e14]:
        - link "Dashboard" [ref=e15] [cursor=pointer]:
          - /url: /dashboard
          - generic [ref=e16]:
            - img [ref=e19]
            - generic [ref=e24]: Dashboard
        - link "Pipeline" [ref=e25] [cursor=pointer]:
          - /url: /pipeline
          - generic [ref=e26]:
            - img [ref=e28]
            - generic [ref=e30]: Pipeline
        - link "Interviews" [ref=e31] [cursor=pointer]:
          - /url: /interviews
          - generic [ref=e32]:
            - img [ref=e34]
            - generic [ref=e36]: Interviews
        - link "Candidates" [ref=e37] [cursor=pointer]:
          - /url: /candidates
          - generic [ref=e38]:
            - img [ref=e40]
            - generic [ref=e45]: Candidates
        - link "Jobs" [ref=e46] [cursor=pointer]:
          - /url: /jobs
          - generic [active] [ref=e47]:
            - img [ref=e49]
            - generic [ref=e52]: Jobs
        - link "Walk-ins" [ref=e53] [cursor=pointer]:
          - /url: /walkins
          - generic [ref=e54]:
            - img [ref=e56]
            - generic [ref=e58]: Walk-ins
        - link "Slot Management" [ref=e59] [cursor=pointer]:
          - /url: /slots
          - generic [ref=e60]:
            - img [ref=e62]
            - generic [ref=e65]: Slot Management
        - link "Settings" [ref=e66] [cursor=pointer]:
          - /url: /settings
          - generic [ref=e67]:
            - img [ref=e69]
            - generic [ref=e72]: Settings
      - generic [ref=e73]:
        - paragraph [ref=e74]: © 2026 Velocity Software Solutions
        - button "Logout" [ref=e75]:
          - img [ref=e76]
          - generic [ref=e79]: Logout
    - generic [ref=e80]:
      - banner [ref=e81]:
        - button "Collapse Sidebar" [ref=e82]:
          - img [ref=e83]
        - generic [ref=e85]:
          - generic [ref=e86]:
            - img [ref=e87]
            - textbox "Search candidates, positions, or modules..." [ref=e90]
          - button "Execute" [ref=e92]:
            - img [ref=e93]
            - generic [ref=e94]: Execute
            - img [ref=e95]
        - generic [ref=e97]:
          - button [ref=e98]:
            - img [ref=e99]
          - generic [ref=e104] [cursor=pointer]:
            - generic [ref=e105]:
              - paragraph [ref=e106]: Administrator
              - paragraph [ref=e107]: hr@velsof.com
            - img "Logo" [ref=e110]
      - main [ref=e111]:
        - generic [ref=e113]:
          - generic [ref=e114]:
            - generic [ref=e115]:
              - heading "Dashboard" [level=1] [ref=e116]
              - generic [ref=e117]:
                - generic [ref=e118] [cursor=pointer]:
                  - img [ref=e120]
                  - generic [ref=e125]:
                    - generic [ref=e126]: Total Talent
                    - generic [ref=e127]: "1"
                - generic [ref=e128] [cursor=pointer]:
                  - img [ref=e130]
                  - generic [ref=e133]:
                    - generic [ref=e134]: Open Jobs
                    - generic [ref=e135]: "2"
                - generic [ref=e136] [cursor=pointer]:
                  - img [ref=e138]
                  - generic [ref=e141]:
                    - generic [ref=e142]: Hired
                    - generic [ref=e143]: "0"
            - generic [ref=e144]:
              - generic [ref=e145]:
                - img [ref=e146]
                - combobox [ref=e148] [cursor=pointer]:
                  - option "Last 1 Month"
                  - option "Last 3 Months" [selected]
                  - option "Last 6 Months"
                  - option "Last 1 Year"
                  - option "Custom Range"
              - button "Launch Walk-in" [ref=e149]:
                - img [ref=e150]
                - generic [ref=e152]: Launch Walk-in
          - generic [ref=e153]:
            - heading "Walk-in Lifecycle Analytics" [level=2] [ref=e156]
            - generic [ref=e157]:
              - generic [ref=e158] [cursor=pointer]:
                - img [ref=e161]
                - generic [ref=e163]: "1"
                - generic [ref=e164]: Total Walk-ins
              - generic [ref=e165] [cursor=pointer]:
                - img [ref=e168]
                - generic [ref=e172]: "0"
                - generic [ref=e173]: Shortlisted Apti
              - generic [ref=e174] [cursor=pointer]:
                - img [ref=e177]
                - generic [ref=e179]: "0"
                - generic [ref=e180]: Tech Interview
              - generic [ref=e181] [cursor=pointer]:
                - img [ref=e184]
                - generic [ref=e189]: "0"
                - generic [ref=e190]: HR Round
              - generic [ref=e191] [cursor=pointer]:
                - img [ref=e194]
                - generic [ref=e200]: "0"
                - generic [ref=e201]: Final Hires
              - generic [ref=e202] [cursor=pointer]:
                - img [ref=e205]
                - generic [ref=e210]: "0"
                - generic [ref=e211]: Total Rejected
              - generic [ref=e212] [cursor=pointer]:
                - img [ref=e215]
                - generic [ref=e218]: "0"
                - generic [ref=e219]: On Trial
              - generic [ref=e220] [cursor=pointer]:
                - img [ref=e223]
                - generic [ref=e226]: 0%
                - generic [ref=e227]: Success Rate
          - generic [ref=e228]:
            - generic [ref=e229]:
              - generic [ref=e230]:
                - generic [ref=e231]:
                  - img [ref=e233]
                  - heading "Application Pipeline" [level=2] [ref=e235]
                - link "View Detailed Report" [ref=e236] [cursor=pointer]:
                  - /url: /pipeline
                  - text: View Detailed Report
                  - img [ref=e237]
              - generic [ref=e240]:
                - generic [ref=e241]:
                  - paragraph [ref=e242]: APPLIED
                  - paragraph [ref=e243]: "1"
                - generic [ref=e244]:
                  - paragraph [ref=e245]: SHORTLISTED
                  - paragraph [ref=e246]: "0"
                - generic [ref=e247]:
                  - paragraph [ref=e248]: INTERVIEW
                  - paragraph [ref=e249]: "3"
                - generic [ref=e250]:
                  - paragraph [ref=e251]: OFFER
                  - paragraph [ref=e252]: "0"
                - generic [ref=e253]:
                  - paragraph [ref=e254]: HIRED
                  - paragraph [ref=e255]: "0"
            - generic [ref=e256]:
              - generic [ref=e257]:
                - img [ref=e259]
                - heading "Retention Health" [level=2] [ref=e265]
              - generic [ref=e266]:
                - generic [ref=e267]:
                  - generic [ref=e268]: Hiring Efficiency
                  - generic [ref=e269]: 84.2%
                - paragraph [ref=e273]: Calculated based on candidate promotion speed and successful 90-day onboarding metrics for current fiscal year.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e279] [cursor=pointer]:
    - generic [ref=e282]:
      - text: Rendering
      - generic [ref=e283]:
        - generic [ref=e284]: .
        - generic [ref=e285]: .
        - generic [ref=e286]: .
  - alert [ref=e287]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Velocity ATS Core Workflow', () => {
  4   |   
  5   |   test('Full Journey: Login -> Job -> Walkin -> Candidate -> Pipeline -> Slot', async ({ page }) => {
  6   |     // 1. Authentication
  7   |     await page.goto('/login');
  8   |     await page.fill('input[type="email"]', 'hr@velsof.com');
  9   |     await page.fill('input[type="password"]', 'velsof123');
  10  |     await page.click('button[type="submit"]');
  11  |     
  12  |     // Wait for dashboard
  13  |     await expect(page).toHaveURL(/.*dashboard/);
  14  |     await expect(page.locator('h1')).toContainText('Dashboard');
  15  | 
  16  |     // Handle any alerts automatically
  17  |     page.on('dialog', dialog => {
  18  |       console.log('Dialog opened:', dialog.message());
  19  |       dialog.dismiss().catch(() => {});
  20  |     });
  21  | 
  22  |     // 2. Create Job
  23  |     await page.click('nav >> text=Jobs');
> 24  |     await expect(page).toHaveURL(/.*jobs/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  25  |     
  26  |     await page.click('button:has-text("Post Job")');
  27  |     await page.waitForSelector('text=Job Configuration & Intelligence');
  28  | 
  29  |     await page.fill('input[placeholder="e.g. Lead Technical Architect"]', 'E2E Test Engineer');
  30  |     
  31  |     // Select Department
  32  |     await page.locator('div:has(> label:text("Department")) >> select').selectOption({ label: 'Software Development and Management' });
  33  |     
  34  |     // Select Position
  35  |     await page.locator('div:has(> label:text("Position")) >> select').selectOption({ label: 'Software Engineer' });
  36  |     
  37  |     // Select Hiring Manager
  38  |     await page.locator('div:has(> label:text("Hiring Manager")) >> select').selectOption({ index: 1 });
  39  | 
  40  |     // Select Posted By
  41  |     await page.locator('div:has(> label:text("Posted By")) >> select').selectOption({ index: 1 });
  42  | 
  43  |     // Fill Location (Mandatory in DTO)
  44  |     await page.fill('input:near(label:text("Location"))', 'Noida (Office)');
  45  | 
  46  |     // Fill Description (Mandatory in DTO)
  47  |     // ReactQuill editor
  48  |     await page.locator('.ql-editor').first().fill('This is a test job description for E2E automation.');
  49  |     
  50  |     // Submit Job and wait for modal to close
  51  |     await Promise.all([
  52  |       page.waitForResponse('**/jobs'),
  53  |       page.click('button:has-text("Initialize Job Campaign")')
  54  |     ]);
  55  |     
  56  |     await expect(page.locator('text=Job Configuration & Intelligence')).not.toBeVisible();
  57  |     await expect(page.locator('table')).toContainText('E2E Test Engineer');
  58  | 
  59  |     // 3. Create Walk-in Campaign
  60  |     await page.click('nav >> text=Walk-ins');
  61  |     await expect(page).toHaveURL(/.*walkins/);
  62  |     
  63  |     await page.click('button:has-text("New Campaign")');
  64  |     await page.fill('input[placeholder="e.g. Mega Walk-in Drive - May 2026"]', 'E2E Automation Drive');
  65  |     await page.fill('input[placeholder="e.g. Node.js Developer"]', 'Automation Expert');
  66  |     
  67  |     await Promise.all([
  68  |       page.waitForResponse('**/walkins/campaign'),
  69  |       page.click('button:has-text("Launch Campaign")')
  70  |     ]);
  71  |     
  72  |     await expect(page.locator('table')).toContainText('E2E Automation Drive');
  73  | 
  74  |     // 4. Create Candidate (Manual)
  75  |     await page.click('nav >> text=Candidates');
  76  |     await page.click('button:has-text("Add Candidate")');
  77  |     await expect(page).toHaveURL(/.*candidates\/new/);
  78  |     
  79  |     const testEmail = `e2e.test.${Date.now()}@example.com`;
  80  |     await page.fill('input:near(label:text("First Name"))', 'Auto');
  81  |     await page.fill('input:near(label:text("Last Name"))', 'Tester');
  82  |     await page.fill('input:near(label:text("Email Address"))', testEmail);
  83  |     
  84  |     await page.click('button:has-text("Save Candidate")');
  85  |     
  86  |     // Wait for Success Modal and Link Job
  87  |     await expect(page.locator('text=Candidate Created!')).toBeVisible();
  88  |     await page.selectOption('select:near(label:text("Select Active Opening"))', { label: 'E2E Test Engineer (Noida (Office))' });
  89  |     await page.click('button:has-text("Link & View Profile")');
  90  |     
  91  |     // Verify Profile
  92  |     await expect(page.locator('h1')).toContainText('Auto Tester');
  93  | 
  94  |     // 5. Verify Pipeline
  95  |     await page.click('nav >> text=Pipeline');
  96  |     await expect(page).toHaveURL(/.*pipeline/);
  97  |     await expect(page.locator('text=Auto Tester')).toBeVisible();
  98  | 
  99  |     // 6. Book Slot
  100 |     // Go back to profile via pipeline click
  101 |     await page.click('text=Auto Tester');
  102 |     await expect(page.locator('h1')).toContainText('Auto Tester');
  103 |     
  104 |     await page.click('button[title="Schedule Interview"]');
  105 |     
  106 |     // In Scheduling Modal
  107 |     await page.selectOption('select:near(label:text("Interview Level"))', { index: 1 });
  108 |     await page.fill('input[type="date"]', '2026-12-25');
  109 |     await page.fill('input[type="time"] >> nth=0', '10:00');
  110 |     await page.fill('input[type="time"] >> nth=1', '11:00');
  111 |     
  112 |     await page.click('button:has-text("Confirm Schedule")');
  113 |     
  114 |     // Verify interview appears in "Scheduled" tab
  115 |     await page.click('button:has-text("Scheduled")');
  116 |     await expect(page.locator('text=10:00 AM - 11:00 AM')).toBeVisible();
  117 |   });
  118 | 
  119 | });
  120 | 
```