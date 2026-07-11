import type { ApiClient } from './client'
import { httpClient } from './httpClient'
import { mockClient } from './mockClient'

// Set VITE_USE_MOCK_API=true in .env to use the in-memory mock instead
const useMock = import.meta.env.VITE_USE_MOCK_API === 'true'

export const api: ApiClient = useMock ? mockClient : httpClient

export type { ApiClient }
export { ApiError } from './mockClient'
