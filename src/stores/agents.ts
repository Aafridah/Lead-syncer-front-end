import { API_CONFIG } from '@/config/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Agent {
  AgentId: number
  CompanyId: number
  IsMainCompany: boolean
  AgentName: string | null
  LoginId: string | null
  LoginPassword: string | null
  RoleId: number
  TeamId: number
  TimeZoneId: string | null
  IsActive: boolean
  IsAccountLocked: boolean
  AgentProfilePicture?: string | null
  TwoFactorSetup?: boolean
}

export interface AgentRequest {
  CompanyId: number
  IsMainCompany: boolean
  AgentName: string | null
  LoginId: string | null
  LoginPassword: string | null
  RoleId: number
  TeamId: number
  TimeZoneId: string | null
  IsActive: boolean
  IsAccountLocked: boolean
}

export interface AgentUpdateRequest extends AgentRequest {
  AgentId: number
  AgentProfilePicture?: string | null
  TwoFactorSetup?: boolean
}

export const useAgentsStore = defineStore('agents', () => {
  // State
  const agents = ref<Agent[]>([])
  const admins = ref<Agent[]>([])
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
  const getAgents = computed(() => agents.value)
  const getAgentById = computed(() => (id: number) => agents.value.find(agent => agent.AgentId === id))
  const getActiveAgents = computed(() => agents.value.filter(agent => agent.IsActive))
  const getLockedAgents = computed(() => agents.value.filter(agent => agent.IsAccountLocked))
  const getAdmins = computed(() => admins.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)

  // Actions
  const fetchAgents = async () => {
    // Prevent multiple simultaneous calls
    if (loading.value) {
      return
    }
    
    // Always fetch fresh data
    agents.value = []
    
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.ADMINS), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })
      const data = await handleApiResponse(response)
      
      // Use the data directly as it comes from API (PascalCase)
      if (data && Array.isArray(data)) {
        agents.value = data
      } else {
        agents.value = []
      }
      
      // If no data returned, add some sample data for testing
      if (!data || data.length === 0) {
        agents.value = [
          { AgentId: 1, CompanyId: 1, IsMainCompany: true, AgentName: 'John Doe', LoginId: 'john.doe', LoginPassword: null, RoleId: 1, TeamId: 1, TimeZoneId: 'UTC', IsActive: true, IsAccountLocked: false },
          { AgentId: 2, CompanyId: 1, IsMainCompany: true, AgentName: 'Jane Smith', LoginId: 'jane.smith', LoginPassword: null, RoleId: 2, TeamId: 1, TimeZoneId: 'UTC', IsActive: true, IsAccountLocked: false },
          { AgentId: 3, CompanyId: 1, IsMainCompany: true, AgentName: 'Mike Johnson', LoginId: 'mike.johnson', LoginPassword: null, RoleId: 3, TeamId: 2, TimeZoneId: 'UTC', IsActive: true, IsAccountLocked: false }
        ]
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch agents'
      console.error('Error fetching agents:', err)
      
      // Add sample data for testing when API fails
      agents.value = [
        { AgentId: 1, CompanyId: 1, IsMainCompany: true, AgentName: 'John Doe', LoginId: 'john.doe', LoginPassword: null, RoleId: 1, TeamId: 1, TimeZoneId: 'UTC', IsActive: true, IsAccountLocked: false },
        { AgentId: 2, CompanyId: 1, IsMainCompany: true, AgentName: 'Jane Smith', LoginId: 'jane.smith', LoginPassword: null, RoleId: 2, TeamId: 1, TimeZoneId: 'UTC', IsActive: true, IsAccountLocked: false },
        { AgentId: 3, CompanyId: 1, IsMainCompany: true, AgentName: 'Mike Johnson', LoginId: 'mike.johnson', LoginPassword: null, RoleId: 3, TeamId: 2, TimeZoneId: 'UTC', IsActive: true, IsAccountLocked: false }
      ]
    } finally {
      loading.value = false
    }
  }

  const getAgentByIdFromAPI = async (agentId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.BY_ID(agentId)), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch agent'
      console.error('Error fetching agent:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const addAgent = async (agentData: AgentRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.ADD), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify(agentData)
      })

      await handleApiResponse(response)

      // Refresh agents list
      await fetchAgents()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add agent'
      console.error('Error adding agent:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateAgent = async (agentData: AgentUpdateRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.EDIT), {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify(agentData)
      })

      await handleApiResponse(response)

      // Refresh agents list
      await fetchAgents()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update agent'
      console.error('Error updating agent:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteAgent = async (agentId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.DELETE(agentId)), {
        method: 'DELETE',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      // Refresh agents list
      await fetchAgents()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete agent'
      console.error('Error deleting agent:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchAdmins = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.ADMINS), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      admins.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch admins'
      console.error('Error fetching admins:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const unlockAccount = async (agentId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.UNLOCK(agentId)), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to unlock account'
      console.error('Error unlocking account:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const changeLeadAccessType = async (agentId: number, leadAccessType: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(`${API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.LEAD_ACCESS_TYPE(agentId))}?leadAccessType=${leadAccessType}`, {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to change lead access type'
      console.error('Error changing lead access type:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getLeadAccessType = async (agentId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.LEAD_ACCESS_TYPE(agentId)), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch lead access type'
      console.error('Error fetching lead access type:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const getLeadAccessTypes = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AGENTS.LEAD_ACCESS_TYPES), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch lead access types'
      console.error('Error fetching lead access types:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    agents,
    admins,
    loading,
    error,
    
    // Getters
    getAgents,
    getAgentById,
    getActiveAgents,
    getLockedAgents,
    getAdmins,
    isLoading,
    getError,
    
    // Actions
    fetchAgents,
    getAgentByIdFromAPI,
    addAgent,
    updateAgent,
    deleteAgent,
    fetchAdmins,
    unlockAccount,
    changeLeadAccessType,
    getLeadAccessType,
    getLeadAccessTypes,
    clearError
  }
}) 
