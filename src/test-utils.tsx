import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        staleTime: 0,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const user = userEvent.setup()
  const result = render(ui, { wrapper: AllTheProviders, ...options })
  return { ...result, user }
}

export * from '@testing-library/react'
export { customRender as render, userEvent }

// Mock user for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
}

// Mock friend data
export const mockFriend = {
  id: 'friend-1',
  username: 'testfriend',
  full_name: 'Test Friend',
  avatar_url: null,
  phone: null,
  preferred_times: [],
  timezone: 'UTC',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  status: 'online' as const,
  lastSeen: new Date(),
  friendshipDate: new Date(),
  friendshipStatus: 'accepted' as const,
  friendshipId: 'friendship-1',
  notes: null,
  favorite: false,
  customMessage: null,
}

// Mock invitation data
export const mockInvitation = {
  id: 'invitation-1',
  inviter_id: 'inviter-1',
  invitee_id: 'test-user-id',
  invitee_email: null,
  invitee_phone: null,
  message: 'Test invitation',
  status: 'pending' as const,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  expires_at: '2023-01-08T00:00:00Z',
  invitation_token: 'test-token',
  inviterProfile: {
    id: 'inviter-1',
    full_name: 'Test Inviter',
    username: 'testinviter',
    avatar_url: null,
    phone: null,
    preferred_times: [],
    timezone: 'UTC',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  inviteeProfile: null,
}

// Mock API error
export const mockApiError = new Error('API request failed')

// Mock network error
export const mockNetworkError = new Error('Network request failed')