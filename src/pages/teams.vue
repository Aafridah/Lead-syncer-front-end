<script lang="ts" setup>
import { useTeamsStore } from '@/stores/teams'
import ManageTeams from '@/views/pages/account-settings/ManageTeams.vue'

const teamsStore = useTeamsStore()
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 mb-4">
        Team Management
      </VCardTitle>
      <VCardText>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Manage your organization's teams and assign members to them.
        </p>
        
        <!-- Import the ManageTeams component -->
        <ManageTeams />
      </VCardText>
    </VCard>
  </div>
</template> 
