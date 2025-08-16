<script lang="ts" setup>
import { useAgentsStore } from '@/stores/agents'
import ManageAgents from '@/views/pages/account-settings/ManageAgents.vue'

const agentsStore = useAgentsStore()
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 mb-4">
        Agent Management
      </VCardTitle>
      <VCardText>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Manage agent accounts, permissions, and team assignments.
        </p>
        
        <!-- Import the ManageAgents component -->
        <ManageAgents />
      </VCardText>
    </VCard>
  </div>
</template> 
