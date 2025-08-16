<script lang="ts" setup>
import { paginationMeta } from '@/utils/paginationMeta'

interface Team {
  id: number
  name: string
  description: string
  memberCount: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// Mock data
const teams = ref<Team[]>([
  {
    id: 1,
    name: 'Sales Team',
    description: 'Primary sales and lead generation team',
    memberCount: 8,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 2,
    name: 'Support Team',
    description: 'Customer support and service team',
    memberCount: 12,
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: 3,
    name: 'Marketing Team',
    description: 'Digital marketing and campaigns team',
    memberCount: 6,
    status: 'active',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15'
  },
  {
    id: 4,
    name: 'Development Team',
    description: 'Software development and maintenance',
    memberCount: 15,
    status: 'inactive',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10'
  }
])

const search = ref('')
const selected = ref<Team[]>([])
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref<keyof Team>('name')
const sortDesc = ref(false)

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedTeam = ref<Team | null>(null)

// Form data
const teamForm = ref({
  name: '',
  description: '',
  status: 'active'
})

const headers = [
  { title: 'Team Name', key: 'name', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Members', key: 'memberCount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed properties
const filteredTeams = computed(() => {
  if (!search.value) return teams.value
  
  return teams.value.filter(team => 
    team.name.toLowerCase().includes(search.value.toLowerCase()) ||
    team.description.toLowerCase().includes(search.value.toLowerCase())
  )
})

const paginatedTeams = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTeams.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredTeams.value.length / itemsPerPage.value))

// Methods
const openAddDialog = () => {
  teamForm.value = { name: '', description: '', status: 'active' }
  showAddDialog.value = true
}

const openEditDialog = (team: Team) => {
  selectedTeam.value = team
  teamForm.value = { ...team }
  showEditDialog.value = true
}

const openDeleteDialog = (team: Team) => {
  selectedTeam.value = team
  showDeleteDialog.value = true
}

const saveTeam = () => {
  if (showEditDialog.value && selectedTeam.value) {
    // Edit existing team
    const index = teams.value.findIndex(t => t.id === selectedTeam.value!.id)
    if (index !== -1) {
      teams.value[index] = { ...teams.value[index], ...teamForm.value, updatedAt: new Date().toISOString().split('T')[0] }
    }
  } else {
    // Add new team
    const newTeam: Team = {
      id: Math.max(...teams.value.map(t => t.id)) + 1,
      ...teamForm.value,
      memberCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    teams.value.push(newTeam)
  }
  
  showAddDialog.value = false
  showEditDialog.value = false
  selectedTeam.value = null
}

const deleteTeam = () => {
  if (selectedTeam.value) {
    const index = teams.value.findIndex(t => t.id === selectedTeam.value!.id)
    if (index !== -1) {
      teams.value.splice(index, 1)
    }
  }
  showDeleteDialog.value = false
  selectedTeam.value = null
}

const getStatusColor = (status: string) => {
  return status === 'active' ? 'success' : 'error'
}

const getStatusIcon = (status: string) => {
  return status === 'active' ? 'bx-check-circle' : 'bx-x-circle'
}
</script>

<template>
  <div>
    <!-- Header with Add Button -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          Manage Teams
        </h4>
        <p class="text-body-1 text-medium-emphasis">
          Create and manage teams for your organization
        </p>
      </div>
      <VBtn
        color="primary"
        prepend-icon="bx-plus"
        @click="openAddDialog"
      >
        Add Team
      </VBtn>
    </div>

    <!-- Search and Filters -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="search"
              prepend-inner-icon="bx-search"
              placeholder="Search teams..."
              hide-details
              density="compact"
            />
          </VCol>
          <VCol cols="12" md="6" class="d-flex justify-end">
            <VSelect
              v-model="itemsPerPage"
              :items="[5, 10, 25, 50]"
              label="Items per page"
              hide-details
              density="compact"
              style="max-inline-size: 150px;"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Teams Table -->
    <VCard>
      <VDataTable
        v-model="selected"
        :headers="headers"
        :items="paginatedTeams"
        :items-per-page="itemsPerPage"
        :page="page"
        :sort-by="[sortBy]"
        :sort-desc="[sortDesc]"
        show-select
        class="text-no-wrap"
        @update:sort-by="sortBy = $event[0]"
        @update:sort-desc="sortDesc = $event[0]"
      >
        <!-- Team Name Column -->
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="32"
              color="primary"
              class="me-3"
            >
              <VIcon size="20" icon="bx-building" />
            </VAvatar>
            <div>
              <div class="font-weight-medium">
                {{ item.name }}
              </div>
            </div>
          </div>
        </template>

        <!-- Description Column -->
        <template #item.description="{ item }">
          <span class="text-truncate d-inline-block" style="max-inline-size: 200px;">
            {{ item.description }}
          </span>
        </template>

        <!-- Members Column -->
        <template #item.memberCount="{ item }">
          <VChip
            size="small"
            color="info"
            variant="tonal"
          >
            {{ item.memberCount }} members
          </VChip>
        </template>

        <!-- Status Column -->
        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="getStatusColor(item.status)"
            variant="tonal"
          >
            <VIcon
              size="16"
              :icon="getStatusIcon(item.status)"
              start
            />
            {{ item.status }}
          </VChip>
        </template>

        <!-- Created Date Column -->
        <template #item.createdAt="{ item }">
          {{ new Date(item.createdAt).toLocaleDateString() }}
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn
              size="small"
              color="primary"
              variant="tonal"
              icon="bx-edit"
              @click="openEditDialog(item)"
            />
            <VBtn
              size="small"
              color="error"
              variant="tonal"
              icon="bx-trash"
              @click="openDeleteDialog(item)"
            />
          </div>
        </template>
      </VDataTable>

      <!-- Pagination -->
      <VDivider />
      <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4">
        <p class="text-sm text-medium-emphasis mb-0">
          {{ paginationMeta({ page, itemsPerPage }, filteredTeams.length) }}
        </p>
        <VPagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
        />
      </VCardText>
    </VCard>

    <!-- Add/Edit Team Dialog -->
    <VDialog
      v-model="showAddDialog || showEditDialog"
      max-inline-size="500px"
      persistent
    >
      <VCard>
        <VCardTitle>
          {{ showEditDialog ? 'Edit Team' : 'Add New Team' }}
        </VCardTitle>
        <VCardText>
          <VForm @submit.prevent="saveTeam">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="teamForm.name"
                  label="Team Name"
                  required
                  hide-details="auto"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="teamForm.description"
                  label="Description"
                  rows="3"
                  hide-details="auto"
                />
              </VCol>
              <VCol cols="12">
                <VSelect
                  v-model="teamForm.status"
                  label="Status"
                  :items="[
                    { title: 'Active', value: 'active' },
                    { title: 'Inactive', value: 'inactive' }
                  ]"
                  hide-details="auto"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            variant="text"
            @click="showAddDialog = false; showEditDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            @click="saveTeam"
          >
            {{ showEditDialog ? 'Update' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog
      v-model="showDeleteDialog"
      max-width="400px"
      persistent
    >
      <VCard>
        <VCardTitle class="text-h6">
          Confirm Delete
        </VCardTitle>
        <VCardText>
          Are you sure you want to delete the team "{{ selectedTeam?.name }}"? This action cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            @click="deleteTeam"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template> 