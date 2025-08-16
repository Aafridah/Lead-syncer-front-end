import { API_CONFIG } from '@/config/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Role {
  RoleId: number
  CompanyId: number
  RoleName: string
  LeadAccessType: string | null
  RoleDeleted: boolean
  RoleCreatedBy: string | null
  RoleCreatedDateTime: string
}

export interface RoleAccess {
  roleAccessId: number
  roleId: number
  roleAccessMasterId: number
  accessAllowed: boolean
  accessDeleted: boolean
}

export const useRolesStore = defineStore('roles', () => {
  // State
  const roles = ref<Role[]>([])
  const roleAccessList = ref<RoleAccess[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper function to handle API responses
  const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        } catch (parseErr) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } else {
        const textResponse = await response.text()
        console.warn('Non-JSON error response:', textResponse)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      const textResponse = await response.text()
      console.warn('Non-JSON response received:', textResponse)
      throw new Error('Invalid response format from server')
    }
  }

  // Getters
  const getRoles = computed(() => roles.value)
  const getRoleById = computed(() => (id: number) => roles.value.find(role => role.RoleId === id))
  const getActiveRoles = computed(() => roles.value.filter(role => !role.RoleDeleted))
  const getRoleAccessList = computed(() => roleAccessList.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)

  // Actions
  const fetchRoles = async () => {
    // Prevent multiple simultaneous calls
    if (loading.value) {
      return
    }
    
    // Always fetch fresh data
    roles.value = []
    
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.ALL), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      roles.value = data
      
      // If no data returned, add some sample data for testing
      if (!data || data.length === 0) {
        roles.value = [
          { RoleId: 1, CompanyId: 1, RoleName: 'Administrator', LeadAccessType: 'Full', RoleDeleted: false, RoleCreatedBy: 'System', RoleCreatedDateTime: '2024-01-01T00:00:00' },
          { RoleId: 2, CompanyId: 1, RoleName: 'Manager', LeadAccessType: 'Team', RoleDeleted: false, RoleCreatedBy: 'System', RoleCreatedDateTime: '2024-01-01T00:00:00' },
          { RoleId: 3, CompanyId: 1, RoleName: 'Agent', LeadAccessType: 'Assigned', RoleDeleted: false, RoleCreatedBy: 'System', RoleCreatedDateTime: '2024-01-01T00:00:00' }
        ]
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch roles'
      console.error('Error fetching roles:', err)
      
      // Add sample data for testing when API fails
      roles.value = [
        { RoleId: 1, CompanyId: 1, RoleName: 'Administrator', LeadAccessType: 'Full', RoleDeleted: false, RoleCreatedBy: 'System', RoleCreatedDateTime: '2024-01-01T00:00:00' },
        { RoleId: 2, CompanyId: 1, RoleName: 'Manager', LeadAccessType: 'Team', RoleDeleted: false, RoleCreatedBy: 'System', RoleCreatedDateTime: '2024-01-01T00:00:00' },
        { RoleId: 3, CompanyId: 1, RoleName: 'Agent', LeadAccessType: 'Assigned', RoleDeleted: false, RoleCreatedBy: 'System', RoleCreatedDateTime: '2024-01-01T00:00:00' }
      ]
    } finally {
      loading.value = false
    }
  }

  const addRole = async (roleData: Omit<Role, 'RoleId' | 'RoleDeleted' | 'RoleCreatedBy' | 'RoleCreatedDateTime'>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.ADD), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify({
          RoleId: 0, // Will be set by the server
          ...roleData,
          RoleDeleted: false,
          RoleCreatedBy: null, // Will be set by the server
          RoleCreatedDateTime: new Date().toISOString()
        })
      })

      await handleApiResponse(response)

      // Refresh roles list
      await fetchRoles()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add role'
      console.error('Error adding role:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (roleData: Role) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.EDIT), {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify(roleData)
      })

      await handleApiResponse(response)

      // Refresh roles list
      await fetchRoles()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update role'
      console.error('Error updating role:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteRole = async (roleId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.DELETE(roleId)), {
        method: 'DELETE',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      // Refresh roles list
      await fetchRoles()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete role'
      console.error('Error deleting role:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getRoleAccessListByRole = async (roleId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.ACCESS_BY_ROLE(roleId)), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      roleAccessList.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch role access list'
      console.error('Error fetching role access list:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const updateRoleAccess = async (roleAccessList: RoleAccess[]) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.ACCESS), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify(roleAccessList)
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update role access'
      console.error('Error updating role access:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const addRoleAccess = async (roleAccess: Omit<RoleAccess, 'roleAccessId'>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.ACCESS_ADD), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify({
          roleAccessId: 0, // Will be set by the server
          ...roleAccess
        })
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add role access'
      console.error('Error adding role access:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateRoleAccessById = async (roleAccess: RoleAccess) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.ACCESS_EDIT), {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify(roleAccess)
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update role access'
      console.error('Error updating role access:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteRoleAccess = async (roleAccessId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ROLES.ACCESS_DELETE(roleAccessId)), {
        method: 'DELETE',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete role access'
      console.error('Error deleting role access:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    roles,
    roleAccessList,
    loading,
    error,
    
    // Getters
    getRoles,
    getRoleById,
    getActiveRoles,
    getRoleAccessList,
    isLoading,
    getError,
    
    // Actions
    fetchRoles,
    addRole,
    updateRole,
    deleteRole,
    getRoleAccessListByRole,
    updateRoleAccess,
    addRoleAccess,
    updateRoleAccessById,
    deleteRoleAccess,
    clearError
  }
}) 
