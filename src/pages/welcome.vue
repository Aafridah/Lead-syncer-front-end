<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = ref([
  {
    icon: 'mdi-chart-line',
    title: 'Analytics Dashboard',
    description: 'Get real-time insights into your business performance with our comprehensive analytics dashboard.',
    color: 'primary'
  },
  {
    icon: 'mdi-account-group',
    title: 'User Management',
    description: 'Efficiently manage users, roles, and permissions with our intuitive user management system.',
    color: 'success'
  },
  {
    icon: 'mdi-cog',
    title: 'Easy Configuration',
    description: 'Customize your experience with our flexible configuration options and settings.',
    color: 'warning'
  },
  {
    icon: 'mdi-shield-check',
    title: 'Secure & Reliable',
    description: 'Your data is protected with enterprise-grade security and reliable infrastructure.',
    color: 'error'
  }
])

const navigateToDashboard = () => {
  router.push('/dashboard')
}

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <VContainer fluid class="welcome-container">
    <!-- Hero Section -->
    <VRow class="hero-section" justify="center" align="center">
      <VCol cols="12" md="8" lg="6" class="text-center">
        <VCard class="hero-card" elevation="0">
          <VCardText class="pa-8">
            <!-- Logo/Brand -->
            <VAvatar size="80" color="primary" class="mb-6">
              <VIcon size="40" color="white">mdi-rocket-launch</VIcon>
            </VAvatar>
            
            <!-- Welcome Title -->
            <h1 class="text-h2 font-weight-bold mb-4 primary--text">
              Welcome to Lead Syncer
            </h1>
            
            <!-- Subtitle -->
            <p class="text-h6 text-medium-emphasis mb-8">
              Your comprehensive solution for lead management and business growth. 
              Get started with our powerful tools and analytics.
            </p>
            
            <!-- Action Buttons -->
            <VRow justify="center" class="mb-8">
              <VCol cols="12" sm="auto">
                <VBtn
                  size="large"
                  color="primary"
                  class="px-8"
                  @click="navigateToDashboard"
                >
                  <VIcon start>mdi-view-dashboard</VIcon>
                  Explore Dashboard
                </VBtn>
              </VCol>
              <VCol cols="12" sm="auto">
                <VBtn
                  size="large"
                  variant="outlined"
                  color="primary"
                  class="px-8"
                  @click="navigateToRegister"
                >
                  <VIcon start>mdi-account-plus</VIcon>
                  Get Started
                </VBtn>
              </VCol>
            </VRow>
            
            <!-- Login Link -->
            <p class="text-body-2 text-medium-emphasis">
              Already have an account? 
              <VBtn
                variant="text"
                color="primary"
                class="text-decoration-none"
                @click="navigateToLogin"
              >
                Sign In
              </VBtn>
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Features Section -->
    <VRow class="features-section" justify="center">
      <VCol cols="12" lg="10">
        <h2 class="text-h4 text-center mb-8 font-weight-bold">
          Why Choose Lead Syncer?
        </h2>
        
        <VRow>
          <VCol
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            sm="6"
            lg="3"
            class="mb-4"
          >
            <VCard class="feature-card h-100" elevation="2">
              <VCardText class="text-center pa-6">
                <VAvatar
                  size="60"
                  :color="feature.color"
                  class="mb-4"
                >
                  <VIcon size="30" color="white">{{ feature.icon }}</VIcon>
                </VAvatar>
                
                <h3 class="text-h6 font-weight-bold mb-3">
                  {{ feature.title }}
                </h3>
                
                <p class="text-body-2 text-medium-emphasis">
                  {{ feature.description }}
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCol>
    </VRow>

    <!-- CTA Section -->
    <VRow class="cta-section" justify="center" align="center">
      <VCol cols="12" md="8" class="text-center">
        <VCard class="cta-card" elevation="0">
          <VCardText class="pa-8">
            <h2 class="text-h4 font-weight-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p class="text-h6 text-medium-emphasis mb-6">
              Join thousands of businesses that trust Lead Syncer for their growth.
            </p>
            <VBtn
              size="large"
              color="primary"
              class="px-8"
              @click="navigateToRegister"
            >
              <VIcon start>mdi-rocket-launch</VIcon>
              Start Your Free Trial
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
.welcome-container {
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-block-size: 100vh;
}

.hero-section {
  min-block-size: 60vh;
  padding-block: 4rem;
  padding-inline: 0;
}

.hero-card {
  border: 1px solid rgba(255, 255, 255, 20%);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 95%);
}

.features-section {
  background: rgba(255, 255, 255, 10%);
  padding-block: 4rem;
  padding-inline: 0;
}

.feature-card {
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 95%);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 15%);
  transform: translateY(-8px);
}

.cta-section {
  padding-block: 4rem;
  padding-inline: 0;
}

.cta-card {
  border: 1px solid rgba(255, 255, 255, 20%);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 95%);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .hero-section {
    min-block-size: 50vh;
    padding-block: 2rem;
    padding-inline: 0;
  }

  .features-section {
    padding-block: 2rem;
    padding-inline: 0;
  }

  .cta-section {
    padding-block: 2rem;
    padding-inline: 0;
  }
}
</style> 
