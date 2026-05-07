import { getApiClient } from '../core/client'
import { API_ENDPOINTS } from '../core/endpoints'

export type AddEmployerLocationCommand = {
  name: string
  description?: string | null
  country: string
  city: string
  line1: string
  latitude: number | string
  longitude: number | string
  geofenceRadiusMetres: number | string
}

export type AddEmployerLocationResult = number

export type ListEmployerLocationsQuery = {
  limit?: number
  offset?: number
}

export type EmployerLocationListItemModel = {
  locationId: number
  name: string
  city: string
  latitude: number
  longitude: number
  geofenceRadiusMetres: number
  isActive: boolean
}

export type UpdateEmployerLocationCommand = AddEmployerLocationCommand & {
  locationId: number
}

export type DeleteEmployerLocationCommand = {
  locationId: number
}

export type PagedListResponse<TItem> = {
  data: TItem[] | null
  hasMore: boolean
  limit: number | string
  offset: number | string
  totalCount: number | string
}

const client = getApiClient()

export const employerLocationsApi = {
  listLocations(body: ListEmployerLocationsQuery = {}) {
    return client.post<PagedListResponse<EmployerLocationListItemModel>, ListEmployerLocationsQuery>(
      API_ENDPOINTS.employers.listLocations,
      body,
      true,
    )
  },
  addLocation(body: AddEmployerLocationCommand) {
    return client.post<AddEmployerLocationResult, AddEmployerLocationCommand>(API_ENDPOINTS.employers.addLocation, body, true)
  },
  updateLocation(body: UpdateEmployerLocationCommand) {
    return client.post<null, UpdateEmployerLocationCommand>(API_ENDPOINTS.employers.updateLocation, body, true)
  },
  deleteLocation(body: DeleteEmployerLocationCommand) {
    return client.post<null, DeleteEmployerLocationCommand>(API_ENDPOINTS.employers.deleteLocation, body, true)
  },
}

