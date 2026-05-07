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
  university: string
  studentNumber: string
  skills: Array<{ id: number; tag: string }>
  educations: WorkerProfileSectionItem[]
  experiences: WorkerProfileSectionItem[]
  certificates: WorkerProfileSectionItem[]
  references: WorkerProfileSectionItem[]
  languages: WorkerProfileSectionItem[]
}
