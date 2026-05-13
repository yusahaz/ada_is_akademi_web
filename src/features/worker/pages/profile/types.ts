import type { WorkerGender } from '../../../../api/core/enums'

export type WorkerProfileSectionItem = {
  id: string
  label: string
  value: string
}

export type ExperienceEditorDraft = {
  id: string
  companyName: string
  position: string
  startDate: string
  endDate: string
}

export type WorkerProfileData = {
  workerId: number
  systemUserId: number
  fullName: string
  email: string
  phone: string
  nationality: string
  gender: WorkerGender
  university: string
  studentNumber: string
  cvOptions?: string | null
  profilePhotoObjectKey?: string | null
  skills: Array<{ id: number; tag: string }>
  educations: WorkerProfileSectionItem[]
  experiences: WorkerProfileSectionItem[]
  certificates: WorkerProfileSectionItem[]
  references: WorkerProfileSectionItem[]
  languages: WorkerProfileSectionItem[]
}
