<script lang="ts" setup>
import { useAgentsStore } from '@/stores/agents'
import { useRolesStore } from '@/stores/roles'
import { useTeamsStore } from '@/stores/teams'
import { nextTick, onMounted } from 'vue'

// Use the stores
const agentsStore = useAgentsStore()
const teamsStore = useTeamsStore()
const rolesStore = useRolesStore()

// Local state for UI
const search = ref('')
const selected = ref<any[]>([])
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref([{ key: 'AgentName', order: 'asc' as const }])
const sortDesc = ref([false])

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedAgent = ref<any | null>(null)

// Computed property for dialog visibility
const showDialog = computed({
  get: () => showAddDialog.value || showEditDialog.value,
  set: (value: boolean) => {
    if (!value) {
      showAddDialog.value = false
      showEditDialog.value = false
    }
  }
})

// Timezone options
const timezoneOptions = [
  { value: 'UTC', text: 'UTC (Coordinated Universal Time)' },
  { value: 'EST', text: 'EST (Eastern Standard Time)' },
  { value: 'CST', text: 'CST (Central Standard Time)' },
  { value: 'MST', text: 'MST (Mountain Standard Time)' },
  { value: 'PST', text: 'PST (Pacific Standard Time)' },
  { value: 'GMT', text: 'GMT (Greenwich Mean Time)' },
  { value: 'IST', text: 'IST (Indian Standard Time)' },
  { value: 'JST', text: 'JST (Japan Standard Time)' },
  { value: 'AEST', text: 'AEST (Australian Eastern Standard Time)' },
  { value: 'CET', text: 'CET (Central European Time)' }
]

// Form data
const agentForm = ref<{
  agentName: string | null
  loginId: string | null
  loginPassword: string | null
  roleId: number
  teamId: number
  timeZoneId: string | null
  isActive: boolean
  isAccountLocked: boolean
}>({
  agentName: '',
  loginId: '',
  loginPassword: '',
  roleId: 1,
  teamId: 1,
  timeZoneId: 'UTC',
  isActive: true,
  isAccountLocked: false
})

const headers = [
  { title: 'Agent ID', key: 'AgentId', sortable: true },
  { title: 'Company ID', key: 'CompanyId', sortable: true },
  { title: 'Agent Name', key: 'AgentName', sortable: true },
  { title: 'Login ID', key: 'LoginId', sortable: true },
  { title: 'Role ID', key: 'RoleId', sortable: true },
  { title: 'Team ID', key: 'TeamId', sortable: true },
  { title: 'Active', key: 'IsActive', sortable: true },
  { title: 'Locked', key: 'IsAccountLocked', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed properties
const filteredAgents = computed(() => {
  if (!search.value) return agentsStore.getAgents
  
  return agentsStore.getAgents.filter((agent: any) => 
    agent.AgentName?.toLowerCase().includes(search.value.toLowerCase()) ||
    agent.LoginId?.toLowerCase().includes(search.value.toLowerCase()) ||
    agent.AgentId?.toString().includes(search.value)
  )
})

const paginatedAgents = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAgents.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredAgents.value.length / itemsPerPage.value))

// Methods
const openAddDialog = () => {
  agentForm.value = {
    agentName: '',
    loginId: '',
    loginPassword: '',
    roleId: 1,
    teamId: 1,
    timeZoneId: 'UTC',
    isActive: true,
    isAccountLocked: false
  }
  showAddDialog.value = true
}

const openEditDialog = async (agent: any) => {
  console.log('Opening edit dialog with agent data:', agent)
  selectedAgent.value = agent
  
  // Set form data
  agentForm.value = {
    agentName: agent.AgentName || '',
    loginId: agent.LoginId || '',
    loginPassword: '',
    roleId: agent.RoleId || 1,
    teamId: agent.TeamId || 1,
    timeZoneId: agent.TimeZoneId || 'UTC',
    isActive: agent.IsActive || true,
    isAccountLocked: agent.IsAccountLocked || false
  }
  
  console.log('Form data set to:', agentForm.value)
  
  // Show dialog first
  showEditDialog.value = true
  
  // Wait for next tick to ensure dialog is rendered
  await nextTick()
  
  // Double-check form data is set
  console.log('Form data after nextTick:', agentForm.value)
}

const openDeleteDialog = (agent: any) => {
  selectedAgent.value = agent
  showDeleteDialog.value = true
}

const saveAgent = async () => {
  try {
    if (showEditDialog.value && selectedAgent.value) {
      // Edit existing agent
      await agentsStore.updateAgent({
        AgentId: selectedAgent.value.AgentId,
        CompanyId: selectedAgent.value.CompanyId,
        IsMainCompany: selectedAgent.value.IsMainCompany,
        AgentName: agentForm.value.agentName,
        LoginId: agentForm.value.loginId,
        LoginPassword: agentForm.value.loginPassword,
        RoleId: agentForm.value.roleId,
        TeamId: agentForm.value.teamId,
        TimeZoneId: agentForm.value.timeZoneId,
        IsActive: agentForm.value.isActive,
        IsAccountLocked: agentForm.value.isAccountLocked
      })
    } else {
      // Add new agent
      await agentsStore.addAgent({
        CompanyId: 1, // Default company ID - adjust as needed
        IsMainCompany: true,
        AgentName: agentForm.value.agentName,
        LoginId: agentForm.value.loginId,
        LoginPassword: agentForm.value.loginPassword,
        RoleId: agentForm.value.roleId,
        TeamId: agentForm.value.teamId,
        TimeZoneId: agentForm.value.timeZoneId,
        IsActive: agentForm.value.isActive,
        IsAccountLocked: agentForm.value.isAccountLocked
      })
    }
    
    showAddDialog.value = false
    showEditDialog.value = false
    selectedAgent.value = null
  } catch (error) {
    console.error('Error saving agent:', error)
  }
}

const deleteAgent = async () => {
  if (selectedAgent.value) {
    try {
      await agentsStore.deleteAgent(selectedAgent.value.AgentId)
      showDeleteDialog.value = false
      selectedAgent.value = null
    } catch (error) {
      console.error('Error deleting agent:', error)
    }
  }
}

const unlockAccount = async (agentId: number) => {
  try {
    await agentsStore.unlockAccount(agentId)
  } catch (error) {
    console.error('Error unlocking account:', error)
  }
}

// Load agents on component mount
onMounted(async () => {
  // Only fetch if we don't already have data and not currently loading
  if (agentsStore.getAgents.length === 0 && !agentsStore.isLoading) {
    await agentsStore.fetchAgents()
  }
  
  // Fetch admins separately
  if (agentsStore.getAdmins.length === 0) {
    await agentsStore.fetchAdmins()
  }
  
  // Fetch teams and roles for dropdowns
  if (teamsStore.getTeams.length === 0 && !teamsStore.isLoading) {
    await teamsStore.fetchTeams()
  }
  
  if (rolesStore.getRoles.length === 0 && !rolesStore.isLoading) {
    await rolesStore.fetchRoles()
  }
})
</script>

<template>
  <div>
    <!-- Header with Add Button -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          Manage Agents
        </h4>
        <p class="text-body-1 text-medium-emphasis">
          Create and manage agents for your organization
        </p>
      </div>
      <VBtn
        color="primary"
        prepend-icon="bx-plus"
        @click="openAddDialog"
      >
        Add Agent
      </VBtn>
    </div>

    <!-- Search and Filters -->
    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex gap-4">
          <VTextField
            v-model="search"
            prepend-inner-icon="bx-search"
            placeholder="Search agents..."
            density="compact"
            hide-details
            style="max-inline-size: 300px;"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Agents Table -->
    <VCard>
      <VCardText>
        <div v-if="agentsStore.isLoading" class="d-flex justify-center py-8">
          <VProgressCircular indeterminate />
        </div>
        
        <div v-else-if="agentsStore.getError" class="d-flex justify-center py-8">
          <VAlert type="error" :text="agentsStore.getError" />
        </div>
        
        <div v-else>
          <div v-if="paginatedAgents.length === 0" class="text-center py-8">
            <VIcon size="48" icon="bx-user" class="text-medium-emphasis mb-4" />
            <p class="text-h6 text-medium-emphasis mb-2">No agents found</p>
            <p class="text-body-2 text-medium-emphasis">Create your first agent to get started.</p>
          </div>
          
          <VDataTable
            v-else
            :headers="headers"
            :items="paginatedAgents"
            :items-per-page="itemsPerPage"
            :sort-by="sortBy"
            :sort-desc="sortDesc"
            @update:sort-by="sortBy = $event"
            @update:sort-desc="sortDesc = $event"
            class="text-no-wrap"
          >
            <!-- Active Status Column -->
            <template #item.IsActive="{ item }">
              <VChip
                size="small"
                :color="item.IsActive ? 'success' : 'error'"
                variant="tonal"
              >
                {{ item.IsActive ? 'Active' : 'Inactive' }}
              </VChip>
            </template>

            <!-- Locked Status Column -->
            <template #item.IsAccountLocked="{ item }">
              <VChip
                size="small"
                :color="item.IsAccountLocked ? 'error' : 'success'"
                variant="tonal"
              >
                {{ item.IsAccountLocked ? 'Locked' : 'Unlocked' }}
              </VChip>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-2">
                <VBtn
                  size="small"
                  color="primary"
                  variant="outlined"
                  @click="openEditDialog(item)"
                >
                  <VIcon size="16" icon="bx-edit" />
                </VBtn>
                <VBtn
                  v-if="item.IsAccountLocked"
                  size="small"
                  color="warning"
                  variant="outlined"
                  @click="unlockAccount(item.AgentId)"
                >
                  <VIcon size="16" icon="bx-lock-open" />
                </VBtn>
                <VBtn
                  size="small"
                  color="error"
                  variant="outlined"
                  @click="openDeleteDialog(item)"
                >
                  <VIcon size="16" icon="bx-trash" />
                </VBtn>
              </div>
            </template>
          </VDataTable>

          <!-- Pagination -->
          <div class="d-flex justify-center mt-4">
            <VPagination
              v-model="page"
              :length="totalPages"
              :total-visible="7"
            />
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Add/Edit Agent Dialog -->
    <VDialog
      v-model="showDialog"
      max-inline-size="800px"
      persistent
    >
      <VCard>
        <VCardTitle>
          {{ showEditDialog ? 'Edit Agent' : 'Add New Agent' }}
        </VCardTitle>
        
        <VCardText>
          <VForm @submit.prevent="saveAgent">
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="agentForm.agentName"
                  label="Agent Name"
                  required
                  :rules="[v => !!v || 'Agent name is required']"
                  :key="`agentName-${agentForm.agentName}`"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="agentForm.loginId"
                  label="Login ID"
                  required
                  :rules="[v => !!v || 'Login ID is required']"
                  :key="`loginId-${agentForm.loginId}`"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="agentForm.loginPassword"
                  label="Password"
                  type="password"
                  :required="!showEditDialog"
                  :rules="showEditDialog ? [] : [v => !!v || 'Password is required']"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="agentForm.roleId"
                  label="Role"
                  :items="rolesStore.getRoles"
                  item-title="RoleName"
                  item-value="RoleId"
                  required
                  :rules="[v => !!v || 'Role is required']"
                  :loading="rolesStore.isLoading"
                  :key="`role-${agentForm.roleId}`"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="agentForm.teamId"
                  label="Team"
                  :items="teamsStore.getTeams"
                  item-title="Name"
                  item-value="TeamId"
                  required
                  :rules="[v => !!v || 'Team is required']"
                  :loading="teamsStore.isLoading"
                  :key="`team-${agentForm.teamId}`"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="agentForm.timeZoneId"
                  label="Time Zone"
                  :items="timezoneOptions"
                  item-title="text"
                  item-value="value"
                  :loading="false"
                  :key="`timezone-${agentForm.timeZoneId}`"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSwitch
                  v-model="agentForm.isActive"
                  label="Active"
                  color="success"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSwitch
                  v-model="agentForm.isAccountLocked"
                  label="Account Locked"
                  color="error"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="showDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            @click="saveAgent"
            :loading="agentsStore.isLoading"
          >
            {{ showEditDialog ? 'Update' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog
      v-model="showDeleteDialog"
      max-inline-size="400px"
      persistent
    >
      <VCard>
        <VCardTitle>
          Confirm Delete
        </VCardTitle>
        
        <VCardText>
          Are you sure you want to delete the agent "{{ selectedAgent?.AgentName }}"?
          This action cannot be undone.
        </VCardText>
        
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="showDeleteDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            @click="deleteAgent"
            :loading="agentsStore.isLoading"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template> 
