<script setup lang="ts">
import { useAuthStore } from '@/stores'
import logo from '@images/logo.svg?raw'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?url'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?url'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const formRef = ref()
const resetToken = ref('')

onMounted(() => {
  // Get token from URL query parameter
  resetToken.value = route.query.token as string || ''
  
  if (!resetToken.value) {
    // Redirect to forgot password if no token
    router.push('/forgot-password')
  }
})

const rules = {
  password: [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  ],
  confirmPassword: [
    (v: string) => !!v || 'Please confirm your password',
    (v: string) => v === form.password || 'Passwords do not match',
  ],
}

const handleResetPassword = async () => {
  const { valid } = await formRef.value.validate()
  
  if (!valid) return

  const success = await authStore.resetPassword({
    token: resetToken.value,
    password: form.password,
    confirmPassword: form.confirmPassword,
  })

  if (success) {
    // Clear form
    form.password = ''
    form.confirmPassword = ''
    
    // Navigate to login page
    router.push('/login')
  }
}

const clearError = () => {
  authStore.clearError()
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VImg
        :src="authV1TopShape"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VImg
        :src="authV1BottomShape"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <RouterLink
            to="/"
            class="app-logo"
          >
            <!-- eslint-disable vue/no-v-html -->
            <div
              class="d-flex"
              v-html="logo"
            />
            <h1 class="app-logo-title">
              Lead Syncer
            </h1>
          </RouterLink>
        </VCardItem>

        <VCardText>
          <h4 class="text-h4 mb-1">
            Reset Password 🔐
          </h4>
          <p class="mb-0">
            Enter your new password below
          </p>
        </VCardText>

        <VCardText>
          <!-- Error Alert -->
          <VAlert
            v-if="authStore.error"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="clearError"
          >
            {{ authStore.error }}
          </VAlert>

          <VForm ref="formRef" @submit.prevent="handleResetPassword">
            <VRow>
              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  autofocus
                  label="New Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :rules="rules.password"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  required
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- confirm password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.confirmPassword"
                  label="Confirm New Password"
                  placeholder="············"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :rules="rules.confirmPassword"
                  :append-inner-icon="isConfirmPasswordVisible ? 'bx-hide' : 'bx-show'"
                  required
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <!-- submit button -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="authStore.isLoading"
                  :disabled="authStore.isLoading"
                >
                  <VIcon start>mdi-lock-reset</VIcon>
                  {{ authStore.isLoading ? 'Resetting...' : 'Reset Password' }}
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol
                cols="12"
                class="text-center text-base"
              >
                <span>Remember your password?</span>
                <RouterLink
                  class="text-primary ms-1"
                  to="/login"
                >
                  Sign in instead
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style> 
