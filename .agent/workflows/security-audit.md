---
description: Workflow for Security tasks - auditing, vulnerability scanning, and compliance
---

# Security Audit Workflow

This workflow guides the process of securing the application and auditing for vulnerabilities.

1.  **Dependency Audit**
    // turbo
    -   Run `npm audit` to check for known vulnerabilities in dependencies.
    -   Review and update outdated packages.

2.  **Code Security Review**
    -   Scan for hardcoded secrets, API keys, or credentials.
    -   Review authentication and authorization logic.
    -   Check for common vulnerabilities (XSS, CSRF, SQL Injection).
    -   Verify input validation and output encoding.

3.  **Configuration Security**
    -   Verify security headers (CSP, HSTS, X-Frame-Options).
    -   Check `.env` files and ensure secrets are not committed to git (check `.gitignore`).
    -   Review cloud/infrastructure configuration (e.g., AWS IAM, Security Groups).

4.  **Access Control Verification**
    -   Test "Least Privilege" access.
    -   Verify role-based access control (RBAC).
    -   Ensure proper session management (cookies, tokens).

5.  **Report & Remediation**
    -   Document found vulnerabilities with severity levels.
    -   Propose remediation steps.
    -   Verify fixes after implementation.
