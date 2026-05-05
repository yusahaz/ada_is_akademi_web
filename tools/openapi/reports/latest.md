# OpenAPI Diff Report

Compared at: 2026-05-05T14:38:41.343Z
OpenAPI source: http://localhost:15080/openapi/v1.json

## Summary
- Used endpoint calls scanned: 42
- Breaking changes: 0
- Attention items: 0
- Safe/unchanged checks: 42

## Breaking
- None

## Attention
- None

## Safe
- `POST Statistics/Overview` in `src\api\admin-dashboard.ts`: No request/response schema ref change detected.
- `POST SystemUsers/RegisterAdmin` in `src\api\auth.ts`: No request/response schema ref change detected.
- `POST SystemUsers/RegisterEmployer` in `src\api\auth.ts`: No request/response schema ref change detected.
- `POST SystemUsers/RegisterWorker` in `src\api\auth.ts`: No request/response schema ref change detected.
- `POST Employers/Activate` in `src\api\employers.ts`: No request/response schema ref change detected.
- `POST Employers/Ban` in `src\api\employers.ts`: No request/response schema ref change detected.
- `POST Employers/GetById` in `src\api\employers.ts`: No request/response schema ref change detected.
- `POST Employers/List` in `src\api\employers.ts`: No request/response schema ref change detected.
- `POST Employers/Suspend` in `src\api\employers.ts`: No request/response schema ref change detected.
- `POST JobPostings/Cancel` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/Complete` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/Create` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/AddSkill` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/ListOpen` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/ListByEmployer` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/GetById` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/Publish` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobPostings/RemoveSkill` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `PUT JobPostings/Update` in `src\api\job-postings.ts`: No request/response schema ref change detected.
- `POST JobApplications/Accept` in `src\api\job-applications.ts`: No request/response schema ref change detected.
- `POST JobApplications/List` in `src\api\job-applications.ts`: No request/response schema ref change detected.
- `POST JobApplications/Reject` in `src\api\job-applications.ts`: No request/response schema ref change detected.
- `POST JobApplications/Submit` in `src\api\job-applications.ts`: No request/response schema ref change detected.
- `POST JobApplications/Withdraw` in `src\api\job-applications.ts`: No request/response schema ref change detected.
- `POST SystemUserGroups/Activate` in `src\api\system-user-groups.ts`: No request/response schema ref change detected.
- `POST SystemUserGroups/AddPermission` in `src\api\system-user-groups.ts`: No request/response schema ref change detected.
- `POST SystemUserGroups/Deactivate` in `src\api\system-user-groups.ts`: No request/response schema ref change detected.
- `POST SystemUserGroups/List` in `src\api\system-user-groups.ts`: No request/response schema ref change detected.
- `POST SystemUsers/Ban` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/ChangePassword` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/Login` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/List` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/Me` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/Reactivate` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/RefreshToken` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/RequestEmailVerification` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/Suspend` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST SystemUsers/VerifyEmail` in `src\api\system-users.ts`: No request/response schema ref change detected.
- `POST Workers/AddSkill` in `src\api\workers.ts`: No request/response schema ref change detected.
- `POST Workers/GetDetail` in `src\api\workers.ts`: Endpoint exists in current OpenAPI but not in baseline with same method.
- `POST Workers/GetById` in `src\api\workers.ts`: No request/response schema ref change detected.
- `POST Workers/List` in `src\api\workers.ts`: No request/response schema ref change detected.
