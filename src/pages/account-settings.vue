<script lang="ts" setup>
import AccountSettingsAccount from '@/views/pages/account-settings/AccountSettingsAccount.vue'
import AccountSettingsNotification from '@/views/pages/account-settings/AccountSettingsNotification.vue'
import AccountSettingsSecurity from '@/views/pages/account-settings/AccountSettingsSecurity.vue'
import ManageTeams from '@/views/pages/account-settings/ManageTeams.vue'
import ManageRoles from '@/views/pages/account-settings/ManageRoles.vue'
import ManageAgents from '@/views/pages/account-settings/ManageAgents.vue'

const route = useRoute()

const activeTab = ref(route.params.tab)

// tabs
const tabs = [
  { title: 'Account', icon: 'bx-user', tab: 'account' },
  { title: 'Security', icon: 'bx-lock-open', tab: 'security' },
  { title: 'Notifications', icon: 'bx-bell', tab: 'notification' },
  { title: 'Agent Management', icon: 'bx-group', tab: 'agent-management' },
]

// agent management sub-tabs
const agentManagementTabs = [
  { title: 'Manage Teams', icon: 'bx-building', tab: 'teams' },
  { title: 'Manage Roles', icon: 'bx-shield', tab: 'roles' },
  { title: 'Manage Agents', icon: 'bx-user-check', tab: 'agents' },
]

const activeAgentTab = ref('teams')
</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      show-arrows
      class="v-tabs-pill"
    >
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
      >
        <VIcon
          size="20"
          start
          :icon="item.icon"
        />
        {{ item.title }}
      </VTab>
    </VTabs>

    <VWindow
      v-model="activeTab"
      class="mt-5 disable-tab-transition"
    >
      <!-- Account -->
      <VWindowItem value="account">
        <AccountSettingsAccount />
      </VWindowItem>

      <!-- Security -->
      <VWindowItem value="security">
        <AccountSettingsSecurity />
      </VWindowItem>

      <!-- Notification -->
      <VWindowItem value="notification">
        <AccountSettingsNotification />
      </VWindowItem>

      <!-- Agent Management -->
      <VWindowItem value="agent-management">
        <VCard>
          <VCardTitle class="text-h5 mb-4">
            Agent Management
          </VCardTitle>
          
          <!-- Agent Management Sub-tabs -->
          <VTabs
            v-model="activeAgentTab"
            show-arrows
            class="v-tabs-pill mb-4"
          >
            <VTab
              v-for="item in agentManagementTabs"
              :key="item.icon"
              :value="item.tab"
            >
              <VIcon
                size="18"
                start
                :icon="item.icon"
              />
              {{ item.title }}
            </VTab>
          </VTabs>

          <!-- Agent Management Content -->
          <VWindow
            v-model="activeAgentTab"
            class="disable-tab-transition"
          >
            <VWindowItem value="teams">
              <ManageTeams />
            </VWindowItem>
            
            <VWindowItem value="roles">
              <ManageRoles />
            </VWindowItem>
            
            <VWindowItem value="agents">
              <ManageAgents />
            </VWindowItem>
          </VWindow>
        </VCard>
      </VWindowItem>
    </VWindow>
  </div>
</template>
