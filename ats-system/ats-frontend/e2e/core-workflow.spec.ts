import { test, expect } from '@playwright/test';

test.describe('Velocity ATS Core Workflow', () => {
  
  test('Full Journey: Login -> Job -> Walkin -> Candidate -> Pipeline -> Slot', async ({ page }) => {
    // 1. Authentication
    await page.goto('/login');
    await page.fill('input[type="email"]', 'hr@velsof.com');
    await page.fill('input[type="password"]', 'velsof123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Handle any alerts automatically
    page.on('dialog', dialog => {
      console.log('Dialog opened:', dialog.message());
      dialog.dismiss().catch(() => {});
    });

    // 2. Create Job
    await page.click('a[href="/jobs"]');
    await expect(page).toHaveURL(/.*jobs/);
    
    await page.click('button:has-text("Post Job")');
    await page.waitForSelector('text=Job Configuration & Intelligence');

    await page.fill('input[placeholder="e.g. Lead Technical Architect"]', 'E2E Test Engineer');
    
    // Select Department
    await page.locator('div:has(> label:text("Department")) >> select').selectOption({ label: 'Software Development and Management' });
    
    // Select Position
    await page.locator('div:has(> label:text("Position")) >> select').selectOption({ label: 'Software Engineer' });
    
    // Select Hiring Manager
    await page.locator('div:has(> label:text("Hiring Manager")) >> select').selectOption({ index: 1 });

    // Select Posted By
    await page.locator('div:has(> label:text("Posted By")) >> select').selectOption({ index: 1 });

    // Fill Location (Mandatory in DTO)
    await page.fill('input:near(label:text("Location"))', 'Noida (Office)');

    // Fill Description (Mandatory in DTO)
    // ReactQuill editor
    await page.locator('.ql-editor').first().fill('This is a test job description for E2E automation.');
    
    // Submit Job and wait for modal to close
    await Promise.all([
      page.waitForResponse('**/jobs'),
      page.click('button:has-text("Initialize Job Campaign")')
    ]);
    
    await expect(page.locator('text=Job Configuration & Intelligence')).not.toBeVisible();
    await expect(page.locator('table')).toContainText('E2E Test Engineer');

    // 3. Create Walk-in Campaign
    await page.click('a[href="/walkins"]');
    await expect(page).toHaveURL(/.*walkins/);
    
    await page.click('button:has-text("New Campaign")');
    await page.fill('input[placeholder="e.g. Mega Walk-in Drive - May 2026"]', 'E2E Automation Drive');
    await page.fill('input[placeholder="e.g. Node.js Developer"]', 'Automation Expert');
    
    await Promise.all([
      page.waitForResponse('**/walkins/campaign'),
      page.click('button:has-text("Launch Campaign")')
    ]);
    
    await expect(page.locator('table')).toContainText('E2E Automation Drive');

    // 4. Create Candidate (Manual)
    await page.click('a[href="/candidates"]');
    await page.click('button:has-text("Add Candidate")');
    await expect(page).toHaveURL(/.*candidates\/new/);
    
    const testEmail = `e2e.test.${Date.now()}@example.com`;
    await page.fill('input:near(label:text("First Name"))', 'Auto');
    await page.fill('input:near(label:text("Last Name"))', 'Tester');
    await page.fill('input:near(label:text("Email Address"))', testEmail);
    
    await page.click('button:has-text("Save Candidate")');
    
    // Wait for Success Modal and Link Job
    await expect(page.locator('text=Candidate Created!')).toBeVisible();
    await page.selectOption('select:near(label:text("Select Active Opening"))', { label: 'E2E Test Engineer (Noida (Office))' });
    await page.click('button:has-text("Link & View Profile")');
    
    // Verify Profile
    await expect(page.locator('h1')).toContainText('Auto Tester');

    // 5. Verify Pipeline
    await page.click('a[href="/pipeline"]');
    await expect(page).toHaveURL(/.*pipeline/);
    await expect(page.locator('text=Auto Tester')).toBeVisible();

    // 6. Book Slot
    // Go back to profile via pipeline click
    await page.click('text=Auto Tester');
    await expect(page.locator('h1')).toContainText('Auto Tester');
    
    await page.click('button[title="Schedule Interview"]');
    
    // In Scheduling Modal
    await page.selectOption('select:near(label:text("Interview Level"))', { index: 1 });
    await page.fill('input[type="date"]', '2026-12-25');
    await page.fill('input[type="time"] >> nth=0', '10:00');
    await page.fill('input[type="time"] >> nth=1', '11:00');
    
    await page.click('button:has-text("Confirm Schedule")');
    
    // Verify interview appears in "Scheduled" tab
    await page.click('button:has-text("Scheduled")');
    await expect(page.locator('text=10:00 AM - 11:00 AM')).toBeVisible();
  });

});
