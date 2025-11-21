// Session management for message board
//   Authentication is optional for this assignment
//   We use simple session management without requiring full authentication
//   Session IDs will be managed client-side and passed with GraphQL mutations

import { statelessSessions } from '@keystone-6/core/session'

// Session configuration for cookie-based sessions
//   These sessions are used for the Admin UI, but the message board
//   will use client-side session management (localStorage)
const sessionMaxAge = 60 * 60 * 24 * 30 // 30 days

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
})

// Export a simple wrapper that doesn't require authentication
//   This allows the Admin UI to work while keeping the API open
export const withAuth = (config: any) => config

export { session }
