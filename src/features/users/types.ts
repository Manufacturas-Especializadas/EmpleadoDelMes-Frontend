export type DepartmentRole = 'HumanResources' | 'Safety' | 'Quality'
export interface Account {
  id: string
  userName: string
  employeeId: string | null
  mustChangePassword: boolean
  roles: string[]
  isActive: boolean
}
export interface AccountListItem extends Account {
  employeeFullName: string | null
}
export interface CreatedAccount {
  account: Account
  temporaryPassword: string
  message: string
}
