<script lang="ts" setup>
import { API_CONFIG } from '@/config/api'
import { ref } from 'vue'

const testResults = ref<string[]>([])
const isLoading = ref(false)

const testApiEndpoint = async (endpoint: string) => {
  isLoading.value = true
  testResults.value = []
  
  try {
    testResults.value.push(`Testing: ${endpoint}`)
    testResults.value.push(`Full URL: ${API_CONFIG.getUrl(endpoint)}`)
    
          const response = await fetch(API_CONFIG.getUrl(endpoint), {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders() // No token for now, but keeping support for later
      })
    
    testResults.value.push(`Status: ${response.status}`)
    testResults.value.push(`Content-Type: ${response.headers.get('content-type')}`)
    testResults.value.push(`Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`)
    
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json()
        testResults.value.push(`JSON Response: ${JSON.stringify(data, null, 2)}`)
      } catch (parseErr) {
        testResults.value.push(`JSON Parse Error: ${parseErr}`)
      }
    } else {
      const textResponse = await response.text()
      testResults.value.push(`Text Response (first 500 chars): ${textResponse.substring(0, 500)}`)
    }
    
  } catch (err) {
    testResults.value.push(`Error: ${err}`)
  } finally {
    isLoading.value = false
  }
}

const testAllEndpoints = async () => {
  // Test base URL first
  await testApiEndpoint('')
  testResults.value.push('---')
  
  await testApiEndpoint(API_CONFIG.ENDPOINTS.TEAMS.ALL)
  testResults.value.push('---')
  await testApiEndpoint(API_CONFIG.ENDPOINTS.ROLES.ALL)
  testResults.value.push('---')
  await testApiEndpoint(API_CONFIG.ENDPOINTS.AGENTS.ADMINS)
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 mb-4">
        API Test Page
      </VCardTitle>
      <VCardText>
        <p class="text-body-1 text-medium-emphasis mb-6">
          This page helps debug API connectivity issues by testing endpoints directly.
        </p>
        
        <div class="mb-6">
          <VBtn
            @click="testApiEndpoint('')"
            :loading="isLoading"
            color="success"
            class="me-4"
          >
            Test Base URL
          </VBtn>
          
          <VBtn
            @click="testAllEndpoints"
            :loading="isLoading"
            color="primary"
            class="me-4"
          >
            Test All Endpoints
          </VBtn>
          
          <VBtn
            @click="testApiEndpoint(API_CONFIG.ENDPOINTS.TEAMS.ALL)"
            :loading="isLoading"
            color="secondary"
            class="me-4"
          >
            Test Teams API
          </VBtn>
          
          <VBtn
            @click="testApiEndpoint(API_CONFIG.ENDPOINTS.ROLES.ALL)"
            :loading="isLoading"
            color="info"
            class="me-4"
          >
            Test Roles API
          </VBtn>
          
          <VBtn
            @click="testApiEndpoint(API_CONFIG.ENDPOINTS.AGENTS.ADMINS)"
            :loading="isLoading"
            color="warning"
          >
            Test Agents API
          </VBtn>
        </div>
        
        <div v-if="testResults.length > 0">
          <h3 class="text-h6 mb-3">Test Results:</h3>
          <VCard variant="outlined">
            <VCardText>
              <div
                v-for="(result, index) in testResults"
                :key="index"
                class="mb-2 font-mono text-sm"
                :class="{
                  'text-primary': result.startsWith('Testing:'),
                  'text-success': result.startsWith('Status: 200'),
                  'text-error': result.startsWith('Status:') && !result.startsWith('Status: 200'),
                  'text-warning': result.startsWith('JSON Parse Error:') || result.startsWith('Error:')
                }"
              >
                {{ result }}
              </div>
            </VCardText>
          </VCard>
        </div>
      </VCardText>
    </VCard>
  </div>
</template> 
