// API Configuration
export const API_CONFIG = {
  // Backend base URL
  BASE_URL: 'https://localhost:7286',
  
  // API endpoints
  ENDPOINTS: {
    // Team Management
    TEAMS: {
      ALL: '/api/ManageTeam/all',
      ADD: '/api/ManageTeam/add',
      EDIT: '/api/ManageTeam/edit',
      DELETE: (id: number) => `/api/ManageTeam/${id}`,
      BY_TEAM: (id: number) => `/api/ManageTeam/by-team/${id}`,
      ASSIGN_MEMBER: '/api/ManageTeam/assign-team-member',
      REMOVE_MEMBER: (id: number) => `/api/ManageTeam/remove-member/${id}`,
    },
    
    // Role Management
    ROLES: {
      ALL: '/api/ManageRole',
      ADD: '/api/ManageRole/add',
      EDIT: '/api/ManageRole/edit',
      DELETE: (id: number) => `/api/ManageRole/${id}`,
      ACCESS: '/api/ManageRoleAccess',
      ACCESS_BY_ROLE: (id: number) => `/api/ManageRoleAccess/by-role/${id}`,
      ACCESS_ADD: '/api/ManageRoleAccess/add',
      ACCESS_EDIT: '/api/ManageRoleAccess/edit',
      ACCESS_DELETE: (id: number) => `/api/ManageRoleAccess/${id}`,
    },
    
    // Agent Management
    AGENTS: {
      ALL: '/api/ManageAgent/all',
      ADMINS: '/api/ManageAgent/admins',
      BY_ID: (id: number) => `/api/ManageAgent/${id}`,
      ADD: '/api/ManageAgent/add',
      EDIT: '/api/ManageAgent/edit',
      DELETE: (id: number) => `/api/ManageAgent/${id}`,
      UNLOCK: (id: number) => `/api/ManageAgent/unlock-account/${id}`,
      LEAD_ACCESS_TYPE: (id: number) => `/api/ManageAgent/lead-access-type/${id}`,
      LEAD_ACCESS_TYPES: '/api/ManageAgent/lead-access-types',
    },
  },
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Helper function to get full URL
  getUrl: (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`,
  
  // Helper function to get auth headers
  getAuthHeaders: (token?: string) => {
    const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  },
} 
