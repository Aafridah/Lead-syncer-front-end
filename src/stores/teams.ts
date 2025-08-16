import { API_CONFIG } from '@/config/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Team {
  TeamId: number
  CompanyId: number
  Name: string
  TeamDeleted?: boolean
  TeamCreatedBy?: string | null
  TeamCreatedDateTime?: string
}

export interface TeamRequest {
  teamId: number
  companyId: number
  name: string
}

export const useTeamsStore = defineStore('teams', () => {
  // State
  const teams = ref<Team[]>([])
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
  const getTeams = computed(() => teams.value)
  const getTeamById = computed(() => (id: number) => teams.value.find(team => team.TeamId === id))
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)

  // Actions
  const fetchTeams = async () => {
    // Prevent multiple simultaneous calls
    if (loading.value) {
      console.warn('Teams fetch already in progress, skipping...')
      return
    }
    
    // Always fetch fresh data
    teams.value = []
    
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TEAMS.ALL), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      
      // Use the data directly as it comes from API (PascalCase)
      if (data && Array.isArray(data)) {
        teams.value = data
      } else {
        teams.value = []
      }
      
      // If no data returned, add some sample data for testing
      if (!data || data.length === 0) {
        teams.value = [
          { TeamId: 1, CompanyId: 1, Name: 'Sales Team', TeamDeleted: false, TeamCreatedBy: 'System', TeamCreatedDateTime: '2024-01-01T00:00:00Z' },
          { TeamId: 2, CompanyId: 1, Name: 'Support Team', TeamDeleted: false, TeamCreatedBy: 'System', TeamCreatedDateTime: '2024-01-01T00:00:00Z' },
          { TeamId: 3, CompanyId: 1, Name: 'Marketing Team', TeamDeleted: false, TeamCreatedBy: 'System', TeamCreatedDateTime: '2024-01-01T00:00:00Z' }
        ]
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch teams'
      console.error('Error fetching teams:', err)
      
      // Add sample data for testing when API fails
      teams.value = [
        { TeamId: 1, CompanyId: 1, Name: 'Sales Team', TeamDeleted: false, TeamCreatedBy: 'System', TeamCreatedDateTime: '2024-01-01T00:00:00Z' },
        { TeamId: 2, CompanyId: 1, Name: 'Support Team', TeamDeleted: false, TeamCreatedBy: 'System', TeamCreatedDateTime: '2024-01-01T00:00:00Z' },
        { TeamId: 3, CompanyId: 1, Name: 'Marketing Team', TeamDeleted: false, TeamCreatedBy: 'System', TeamCreatedDateTime: '2024-01-01T00:00:00Z' }
      ]
    } finally {
      loading.value = false
    }
  }
  

  const addTeam = async (teamData: Omit<TeamRequest, 'teamId'>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TEAMS.ADD), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify({
          teamId: 0, // Will be set by the server
          ...teamData
        })
      })

      await handleApiResponse(response)

      // Refresh teams list
      await fetchTeams()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add team'
      console.error('Error adding team:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateTeam = async (teamData: TeamRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TEAMS.EDIT), {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders(), // No token for now, but keeping support for later
        body: JSON.stringify(teamData)
      })

      await handleApiResponse(response)

      // Refresh teams list
      await fetchTeams()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update team'
      console.error('Error updating team:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteTeam = async (teamId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TEAMS.DELETE(teamId)), {
        method: 'DELETE',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      // Refresh teams list
      await fetchTeams()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete team'
      console.error('Error deleting team:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getTeamMembers = async (teamId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TEAMS.BY_TEAM(teamId)), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      const data = await handleApiResponse(response)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch team members'
      console.error('Error fetching team members:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const assignTeamMember = async (teamId: number, agentId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(`${API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TEAMS.ASSIGN_MEMBER)}?teamId=${teamId}&agentId=${agentId}`, {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to assign team member'
      console.error('Error assigning team member:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const removeTeamMember = async (agentId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TEAMS.REMOVE_MEMBER(agentId)), {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })

      await handleApiResponse(response)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove team member'
      console.error('Error removing team member:', err)
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
    teams,
    loading,
    error,
    
    // Getters
    getTeams,
    getTeamById,
    isLoading,
    getError,
    
    // Actions
    fetchTeams,
    addTeam,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    assignTeamMember,
    removeTeamMember,
    clearError
  }
}) 
