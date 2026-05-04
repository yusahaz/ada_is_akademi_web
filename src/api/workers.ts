import { getApiClient } from './client'

export type AddWorkerSkillCommand = {
  tag: string
  workerId: number
}

export type GetWorkerByIdQuery = {
  workerId: number
}

export type WorkerDetail = {
  id: number
  systemUserId: number
  nationality: string | null
  university: string | null
  embeddingUpdatedAt: string | null
  skillTags: string[]
}

const client = getApiClient()

export const workersApi = {
  addSkill(body: AddWorkerSkillCommand) {
    return client.post<number, AddWorkerSkillCommand>(
      'Workers/AddSkill',
      body,
      true,
    )
  },
  getById(body: GetWorkerByIdQuery) {
    return client.post<WorkerDetail, GetWorkerByIdQuery>(
      'Workers/GetById',
      body,
      true,
    )
  },
}
