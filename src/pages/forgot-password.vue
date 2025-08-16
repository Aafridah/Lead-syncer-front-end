<script setup lang="ts">
import { useAuthStore } from '@/stores'
import logo from '@images/logo.svg?raw'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?url'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?url'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
})

const formRef = ref()

const rules = {
  email: [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
  ],
}

const handleForgotPassword = async () => {
  const { valid } = await formRef.value.validate()
  
  if (!valid) return

  const success = await authStore.requestPasswordReset({
    email: form.email,
  })

  if (success) {
    // Clear form
    form.email = ''
    
    // Show success message (you can implement a toast or alert)
    console.log('Password reset email sent successfully!')
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
            Forgot Password? 🔒
          </h4>
          <p class="mb-0">
            Enter your email and we'll send you instructions to reset your password
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

          <VForm ref="formRef" @submit.prevent="handleForgotPassword">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="form.email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                  :rules="rules.email"
                  required
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
                  <VIcon start>mdi-email-send</VIcon>
                  {{ authStore.isLoading ? 'Sending...' : 'Send Reset Link' }}
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
