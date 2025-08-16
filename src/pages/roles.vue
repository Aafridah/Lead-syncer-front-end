<script lang="ts" setup>
import { useRolesStore } from '@/stores/roles'
import ManageRoles from '@/views/pages/account-settings/ManageRoles.vue'

const rolesStore = useRolesStore()
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 mb-4">
        Role Management
      </VCardTitle>
      <VCardText>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Manage user roles and permissions for your organization.
        </p>
        
        <!-- Import the ManageRoles component -->
        <ManageRoles />
      </VCardText>
    </VCard>
  </div>
</template> 
