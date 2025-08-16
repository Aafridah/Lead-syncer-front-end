<script setup lang="ts">
import { useAuthStore } from '@/stores'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import logo from '@images/logo.svg?raw'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?url'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?url'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  privacyPolicies: false,
})

const isPasswordVisible = ref(false)
const formRef = ref()

const rules = {
  username: [
    (v: string) => !!v || 'Username is required',
    (v: string) => v.length >= 3 || 'Username must be at least 3 characters',
  ],
  email: [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
  ],
  password: [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  ],
  privacyPolicies: [
    (v: boolean) => !!v || 'You must agree to privacy policy & terms',
  ],
}

const handleRegister = async () => {
  debugger
  const { valid } = await formRef.value.validate()
  
  if (!valid) return

  const success = await authStore.register({
    username: form.username,
    email: form.email,
    password: form.password,
    privacyPolicies: form.privacyPolicies,
  })

  if (success) {
    // Clear form
    form.username = ''
    form.email = ''
    form.password = ''
    form.privacyPolicies = false
    
    // Navigate to dashboard
    router.push('/dashboard')
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

      <!-- 👉 Auth card -->
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
            Adventure starts here 🚀
          </h4>
          <p class="mb-0">
            Make your app management easy and fun!
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

          <VForm ref="formRef" @submit.prevent="handleRegister">
            <VRow>
              <!-- Username -->
              <VCol cols="12">
                <VTextField
                  v-model="form.username"
                  autofocus
                  label="Username"
                  placeholder="Johndoe"
                  :rules="rules.username"
                  required
                />
              </VCol>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                  :rules="rules.email"
                  required
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="Password"
                  autocomplete="password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :rules="rules.password"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  required
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center my-6">
                  <VCheckbox
                    id="privacy-policy"
                    v-model="form.privacyPolicies"
                    inline
                    :rules="rules.privacyPolicies"
                  />
                  <VLabel
                    for="privacy-policy"
                    style="opacity: 1;"
                  >
                    <span class="me-1 text-high-emphasis">I agree to</span>
                    <a
                      href="javascript:void(0)"
                      class="text-primary"
                    >privacy policy & terms</a>
                  </VLabel>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="authStore.isLoading"
                  :disabled="authStore.isLoading"
                >
                  <VIcon start>mdi-account-plus</VIcon>
                  {{ authStore.isLoading ? 'Creating Account...' : 'Sign up' }}
                </VBtn>
              </VCol>

              <!-- login instead -->
              <VCol
                cols="12"
                class="text-center text-base"
              >
                <span>Already have an account?</span>
                <RouterLink
                  class="text-primary ms-1"
                  to="/login"
                >
                  Sign in instead
                </RouterLink>
              </VCol>

              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>

              <!-- auth providers -->
              <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
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
