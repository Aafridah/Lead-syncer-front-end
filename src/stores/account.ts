import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiService } from './api'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  phone?: string
  address?: string
  state?: string
  zip?: string
  country?: string
  language?: string
  timezone?: string
  currency?: string
  organization?: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  state?: string
  zip?: string
  country?: string
  language?: string
  timezone?: string
  currency?: string
  organization?: string
}

interface NotificationSettings {
  email: boolean
  browser: boolean
  app: boolean
}

interface NotificationPreferences {
  newForYou: NotificationSettings
  accountActivity: NotificationSettings
  newBrowserSignIn: NotificationSettings
  newDeviceLinked: NotificationSettings
  notificationTiming: 'online' | 'anytime'
}

export const useAccountStore = defineStore('account', () => {
  // State
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const notificationPreferences = ref<NotificationPreferences>({
    newForYou: { email: true, browser: true, app: true },
    accountActivity: { email: true, browser: true, app: true },
    newBrowserSignIn: { email: true, browser: true, app: false },
    newDeviceLinked: { email: true, browser: false, app: false },
    notificationTiming: 'online'
  })

  // Getters
  const fullName = computed(() => {
    if (!profile.value) return ''
    return `${profile.value.firstName} ${profile.value.lastName}`.trim()
  })

  const displayName = computed(() => {
    if (!profile.value) return 'Guest'
    return profile.value.firstName || profile.value.email
  })

  const isProfileLoaded = computed(() => !!profile.value)

  // Actions
  const fetchProfile = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiService.get<UserProfile>('/account/profile')
      profile.value = response.data
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiService.put<UserProfile>('/account/profile', data)
      profile.value = response.data
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (data: ChangePasswordData): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      await apiService.post('/account/change-password', data)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to change password'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const uploadAvatar = async (file: File): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiService.upload<{ avatar: string }>('/account/avatar', file)
      if (profile.value) {
        profile.value.avatar = response.data.avatar
      }
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to upload avatar'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteAccount = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      await apiService.delete('/account')
      profile.value = null
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete account'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchNotificationPreferences = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiService.get<NotificationPreferences>('/account/notifications')
      notificationPreferences.value = response.data
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to load notification preferences'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiService.put<NotificationPreferences>('/account/notifications', preferences)
      notificationPreferences.value = response.data
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update notification preferences'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getRecentDevices = async () => {
    try {
      const response = await apiService.get('/account/devices')
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load recent devices'
      return []
    }
  }

  const revokeDevice = async (deviceId: string): Promise<boolean> => {
    try {
      await apiService.delete(`/account/devices/${deviceId}`)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to revoke device'
      return false
    }
  }

  const createApiKey = async (name: string, permissions: string): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      await apiService.post('/account/api-keys', { name, permissions })
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to create API key'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getApiKeys = async () => {
    try {
      const response = await apiService.get('/account/api-keys')
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load API keys'
      return []
    }
  }

  const revokeApiKey = async (keyId: string): Promise<boolean> => {
    try {
      await apiService.delete(`/account/api-keys/${keyId}`)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to revoke API key'
      return false
    }
  }

  const enableTwoFactorAuth = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      await apiService.post('/account/2fa/enable')
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to enable two-factor authentication'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const disableTwoFactorAuth = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      await apiService.post('/account/2fa/disable')
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to disable two-factor authentication'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const resetProfile = (): void => {
    profile.value = null
    error.value = null
  }

  return {
    // State
    profile,
    isLoading,
    error,
    notificationPreferences,

    // Getters
    fullName,
    displayName,
    isProfileLoaded,

    // Actions
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAccount,
    fetchNotificationPreferences,
    updateNotificationPreferences,
    getRecentDevices,
    revokeDevice,
    createApiKey,
    getApiKeys,
    revokeApiKey,
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    clearError,
    resetProfile,
  }
}) 
