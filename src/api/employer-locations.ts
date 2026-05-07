import { getApiClient } from './client'
import { API_ENDPOINTS } from './endpoints'

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

const client = getApiClient()

export const employerLocationsApi = {
  addLocation(body: AddEmployerLocationCommand) {
    return client.post<AddEmployerLocationResult, AddEmployerLocationCommand>(API_ENDPOINTS.employers.addLocation, body, true)
  },
}

