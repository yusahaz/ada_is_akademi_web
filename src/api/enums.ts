export const AccountStatus = {
  Active: 10,
  Banned: 30,
  Pending: 0,
  Suspended: 20,
} as const

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]

export const DevicePlatform = {
  Android: 20,
  iOS: 10,
  Web: 30,
} as const

export type DevicePlatform = (typeof DevicePlatform)[keyof typeof DevicePlatform]

export const EducationType = {
  AssociateDegree: 30,
  BachelorDegree: 40,
  Doctorate: 60,
  HighSchool: 10,
  MasterDegree: 50,
  Other: 99,
  VocationalCourse: 20,
} as const

export type EducationType = (typeof EducationType)[keyof typeof EducationType]

export const EmployerStatus = {
  Active: 20,
  Banned: 90,
  Pending: 10,
  Suspended: 30,
} as const

export type EmployerStatus = (typeof EmployerStatus)[keyof typeof EmployerStatus]

export const JobApplicationStatus = {
  Accepted: 20,
  Pending: 10,
  Rejected: 30,
  Withdrawn: 40,
  Expired: 50,
} as const

export type JobApplicationStatus =
  (typeof JobApplicationStatus)[keyof typeof JobApplicationStatus]

export const JobPostingStatus = {
  Cancelled: 40,
  Completed: 30,
  Draft: 10,
  Filled: 25,
  Open: 20,
} as const

export type JobPostingStatus = (typeof JobPostingStatus)[keyof typeof JobPostingStatus]

export const LanguageLevel = {
  Advanced: 50,
  Beginner: 10,
  Elementary: 20,
  Intermediate: 30,
  Native: 60,
  UpperIntermediate: 40,
} as const

export type LanguageLevel = (typeof LanguageLevel)[keyof typeof LanguageLevel]

export const MembershipScopeType = {
  EmployerScoped: 1,
  Global: 0,
  LocationScoped: 2,
} as const

export type MembershipScopeType =
  (typeof MembershipScopeType)[keyof typeof MembershipScopeType]

export const PermissionEffect = {
  Allow: 10,
  Deny: 20,
} as const

export type PermissionEffect = (typeof PermissionEffect)[keyof typeof PermissionEffect]

export const ShiftAssignmentStatus = {
  Pending: 10,
  CheckedIn: 20,
  CheckedOut: 30,
} as const

export type ShiftAssignmentStatus =
  (typeof ShiftAssignmentStatus)[keyof typeof ShiftAssignmentStatus]

export const SystemUserType = {
  Admin: 10,
  Employer: 20,
  Worker: 30,
} as const

export type SystemUserType = (typeof SystemUserType)[keyof typeof SystemUserType]
