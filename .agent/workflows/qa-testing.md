---
description: Workflow for QA & Testing tasks - test planning, execution, and bug reporting
---

# Quality & Testing Workflow

This workflow ensures the software meets quality standards through structured testing.

1.  **Test Planning**
    -   Review requirements and design documents.
    -   Define the test strategy (Unit, Integration, E2E, Manual).
    -   Identify test scenarios and edge cases.

2.  **Test Case Creation**
    -   Write detailed test steps for manual testing.
    -   Create test scripts for automated testing (e.g., Playwright, Jest).
    -   Prepare test data.

3.  **Test Execution**
    -   Run automated test suites (`npm test`, `npm run build`, etc.).
    -   Perform manual exploratory testing.
    -   Verify UI/UX against design specs.
    // turbo
    -   Run linting checks (`npm run lint`).

4.  **Bug Reporting & Verification**
    -   Log defects with reproduction steps, expected vs. actual results, and screenshots.
    -   Verify fixes after developer resolution.
    -   Perform regression testing to ensure no new issues were introduced.

5.  **Sign-off**
    -   Confirm all critical tests pass.
    -   Validate that acceptance criteria are met.
