interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

class ApiService {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token')
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          errors: errorData.errors,
        } as ApiError
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Network error. Please check your connection.',
          status: 0,
        } as ApiError
      }
      throw error
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('auth_token')
    
    const xhr = new XMLHttpRequest()
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve({ data, success: true })
          } catch {
            resolve({ data: xhr.responseText as T, success: true })
          }
        } else {
          reject({
            message: `Upload failed with status ${xhr.status}`,
            status: xhr.status,
          } as ApiError)
        }
      })

      xhr.addEventListener('error', () => {
        reject({
          message: 'Upload failed due to network error',
          status: 0,
        } as ApiError)
      })

      xhr.open('POST', `${this.baseURL}${endpoint}`)
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      xhr.send(formData)
    })
  }
}

// Create singleton instance
export const apiService = new ApiService()

// Export types for use in other files
export type { ApiError, ApiResponse }
