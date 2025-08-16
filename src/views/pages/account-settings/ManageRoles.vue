<script lang="ts" setup>
import { useRolesStore } from '@/stores/roles'
import { onMounted } from 'vue'

// Use the roles store
const rolesStore = useRolesStore()

// Local state for UI
const search = ref('')
const selected = ref<any[]>([])
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref([{ key: 'RoleName', order: 'asc' as const }])
const sortDesc = ref([false])

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedRole = ref<any | null>(null)

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

// Form data
const roleForm = ref<{
  roleName: string
  leadAccessType: string | null
}>({
  roleName: '',
  leadAccessType: null
})

const headers = [
  { title: 'Role ID', key: 'RoleId', sortable: true },
  { title: 'Company ID', key: 'CompanyId', sortable: true },
  { title: 'Role Name', key: 'RoleName', sortable: true },
  { title: 'Lead Access Type', key: 'LeadAccessType', sortable: true },
  { title: 'Created By', key: 'RoleCreatedBy', sortable: true },
  { title: 'Created Date', key: 'RoleCreatedDateTime', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed properties
const filteredRoles = computed(() => {
  if (!search.value) return rolesStore.getRoles
  
  return rolesStore.getRoles.filter((role: any) => 
    role.RoleName?.toLowerCase().includes(search.value.toLowerCase()) ||
    role.RoleId?.toString().includes(search.value)
  )
})

const paginatedRoles = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRoles.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredRoles.value.length / itemsPerPage.value))

// Methods
const openAddDialog = () => {
  roleForm.value = { roleName: '', leadAccessType: null }
  showAddDialog.value = true
}

const openEditDialog = (role: any) => {
  selectedRole.value = role
  roleForm.value = { 
    roleName: role.RoleName || '', 
    leadAccessType: role.LeadAccessType || null 
  }
  showEditDialog.value = true
}

const openDeleteDialog = (role: any) => {
  selectedRole.value = role
  showDeleteDialog.value = true
}

const saveRole = async () => {
  try {
    if (showEditDialog.value && selectedRole.value) {
      // Edit existing role
      await rolesStore.updateRole({
        ...selectedRole.value,
        RoleName: roleForm.value.roleName,
        LeadAccessType: roleForm.value.leadAccessType
      })
    } else {
      // Add new role
      await rolesStore.addRole({
        CompanyId: 1, // Default company ID - adjust as needed
        RoleName: roleForm.value.roleName,
        LeadAccessType: roleForm.value.leadAccessType
      })
    }
    
    showAddDialog.value = false
    showEditDialog.value = false
    selectedRole.value = null
  } catch (error) {
    console.error('Error saving role:', error)
  }
}

const deleteRole = async () => {
  if (selectedRole.value) {
    try {
      await rolesStore.deleteRole(selectedRole.value.RoleId)
      showDeleteDialog.value = false
      selectedRole.value = null
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }
}

// Load roles on component mount
onMounted(async () => {
  // Only fetch if we don't already have data and not currently loading
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
          Manage Roles
        </h4>
        <p class="text-body-1 text-medium-emphasis">
          Create and manage roles for your organization
        </p>
      </div>
      <VBtn
        color="primary"
        prepend-icon="bx-plus"
        @click="openAddDialog"
      >
        Add Role
      </VBtn>
    </div>

    <!-- Search and Filters -->
    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex gap-4">
          <VTextField
            v-model="search"
            prepend-inner-icon="bx-search"
            placeholder="Search roles..."
            density="compact"
            hide-details
            style="max-inline-size: 300px;"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Roles Table -->
    <VCard>
      <VCardText>
        <div v-if="rolesStore.isLoading" class="d-flex justify-center py-8">
          <VProgressCircular indeterminate />
        </div>
        
        <div v-else-if="rolesStore.getError" class="d-flex justify-center py-8">
          <VAlert type="error" :text="rolesStore.getError" />
        </div>
        
        <div v-else>
          <div v-if="paginatedRoles.length === 0" class="text-center py-8">
            <VIcon size="48" icon="bx-shield" class="text-medium-emphasis mb-4" />
            <p class="text-h6 text-medium-emphasis mb-2">No roles found</p>
            <p class="text-body-2 text-medium-emphasis">Create your first role to get started.</p>
          </div>
          
          <VDataTable
            v-else
            :headers="headers"
            :items="paginatedRoles"
            :items-per-page="itemsPerPage"
            :sort-by="sortBy"
            :sort-desc="sortDesc"
            @update:sort-by="sortBy = $event"
            @update:sort-desc="sortDesc = $event"
            class="text-no-wrap"
          >
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

    <!-- Add/Edit Role Dialog -->
    <VDialog
      v-model="showDialog"
      max-inline-size="600px"
      persistent
    >
      <VCard>
        <VCardTitle>
          {{ showEditDialog ? 'Edit Role' : 'Add New Role' }}
        </VCardTitle>
        
        <VCardText>
          <VForm @submit.prevent="saveRole">
            <VTextField
              v-model="roleForm.roleName"
              label="Role Name"
              required
              :rules="[v => !!v || 'Role name is required']"
            />
            <VTextField
              v-model="roleForm.leadAccessType"
              label="Lead Access Type"
              class="mt-4"
            />
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
            @click="saveRole"
            :loading="rolesStore.isLoading"
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
          Are you sure you want to delete the role "{{ selectedRole?.roleName }}"?
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
            @click="deleteRole"
            :loading="rolesStore.isLoading"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template> 
