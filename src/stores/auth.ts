import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiService } from './api'

interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  username: string
  email: string
  password: string
  privacyPolicies: boolean
}

interface ResetPasswordCredentials {
  email: string
}

interface ResetPasswordConfirmCredentials {
  token: string
  password: string
  confirmPassword: string
}

interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'guest')
  const userName = computed(() => user.value?.name || 'Guest')

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null
debugger
      const response = await apiService.post<LoginResponse>('/auth/login', credentials)

      // Store authentication data
      user.value = response.data.user
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken

      // Store in localStorage for persistence
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_refresh_token', response.data.refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))

      return true
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Call logout API if needed
      if (token.value) {
        await apiService.post('/auth/logout')
      }
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      // Clear local state
      user.value = null
      token.value = null
      refreshToken.value = null
      error.value = null

      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')
    }
  }

  const refreshAuth = async (): Promise<boolean> => {
    try {
      if (!refreshToken.value) {
        return false
      }

      const response = await apiService.post<LoginResponse>('/auth/refresh', {
        refreshToken: refreshToken.value,
      })

      // Update tokens
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken

      // Update localStorage
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_refresh_token', response.data.refreshToken)

      return true
    } catch (err) {
      console.error('Token refresh error:', err)
      await logout()
      return false
    }
  }

  const initializeAuth = (): void => {
    // Load authentication data from localStorage on app start
    const storedToken = localStorage.getItem('auth_token')
    const storedRefreshToken = localStorage.getItem('auth_refresh_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        refreshToken.value = storedRefreshToken
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('Error parsing stored user data:', err)
        // Clear corrupted data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_refresh_token')
        localStorage.removeItem('auth_user')
      }
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      debugger
      isLoading.value = true
      error.value = null

      const response = await apiService.post<LoginResponse>('/auth/register', credentials)

      // Store authentication data
      user.value = response.data.user
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken

      // Store in localStorage for persistence
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_refresh_token', response.data.refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))

      return true
    } catch (err: any) {
      error.value = err.message || 'Registration failed. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const requestPasswordReset = async (credentials: ResetPasswordCredentials): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      await apiService.post('/auth/forgot-password', credentials)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset email. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (credentials: ResetPasswordConfirmCredentials): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      await apiService.post('/auth/reset-password', credentials)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = (userData: Partial<User>): void => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  return {
    // State
    user,
    token,
    refreshToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userRole,
    userName,

    // Actions
    login,
    register,
    logout,
    refreshAuth,
    initializeAuth,
    clearError,
    updateUser,
    requestPasswordReset,
    resetPassword,
  }
}) 
