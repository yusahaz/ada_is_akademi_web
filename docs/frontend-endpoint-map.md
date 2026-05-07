# Frontend Endpoint Map (Post-Login)

Bu dosya `http://localhost:15080/openapi/v1.json` ile hizalanmis, login sonrasi ekranlarin kullandigi endpointleri listeler.

## Auth (Global)

- `SystemUsers/Login`: Login modal girisi
- `SystemUsers/Me`: Session ve rol bazli ekran acilis verisi
- `SystemUsers/RefreshToken`: API client seviyesinde `401 -> refresh -> retry`

## Worker

- `Workers/GetSelfFullDetail` (tercih)
- `Workers/GetSelfSummary` (fallback)
- `Workers/GetById` (son fallback, `Me.workerId` ile)
- `JobPostings/ListOpen`
- `JobPostings/GetById`
- `JobApplications/List`
- `JobApplications/Submit`

## Employer

- `JobPostings/ListByEmployer`
- `JobPostings/GetById`
- `JobApplications/List`

Not: Employer posting filtrelerinde `draft/completed` backend summary modelinde status donmedigi icin endpoint-guvenli fallback olarak bos liste kullanilir.

## Admin

- `Statistics/Overview`
- `SystemUsers/Me`
- `SystemUsers/List`, `SystemUsers/Suspend`, `SystemUsers/Reactivate`, `SystemUsers/Ban`, `SystemUsers/ChangePassword`
- `SystemUserGroups/List`, `SystemUserGroups/Activate`, `SystemUserGroups/Deactivate`, `SystemUserGroups/AddPermission`
- `Workers/List`, `Workers/GetDetail`, `Workers/AddSkill`
- `Employers/List`, `Employers/GetById`, `Employers/Activate`, `Employers/Suspend`, `Employers/Ban`

## Matrix (Screen -> Endpoint)

- Worker `ProfilePage`: `Me` + `Workers/GetSelfFullDetail|GetSelfSummary|GetById`
- Worker `ShiftsPage`: `JobPostings/ListOpen`, `JobApplications/Submit`
- Worker `ApplicationsPage`: `Me` + `JobPostings/ListOpen` + `JobApplications/List`
- Worker `PayoutsPage`: `ApplicationsPage` akisi uzerinden turetilmis veri (OpenAPI-disina cikmadan)
- Worker `ReportsPage`: `PayoutsPage` akisi uzerinden turetilmis veri (OpenAPI-disina cikmadan)
- Worker `CvImportPage`: `ProfilePage` akisi uzerinden turetilmis durum
- Worker `QrCheckPage`: `JobPostings/GetById` ile dogrulama
- Employer `EmployerDashboard`: `ListByEmployer`, `GetById`, `JobApplications/List`
- Admin `AdminDashboard` ve alt bolumler: yukaridaki admin endpoint seti
