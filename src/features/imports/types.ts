export interface EmployeeImportRow {
  rowNumber: number
  payrollNumber: string
  fullName: string
  isValid: boolean
  errors: string[]
  existsInDatabase: boolean
}
export interface EmployeeImportPreview {
  totalRows: number
  validRows: number
  invalidRows: number
  newRows: number
  existingRows: number
  rows: EmployeeImportRow[]
}
export interface EmployeeImportResult {
  message: string
  totalRows: number
  insertedRows: number
  skippedExistingRows: number
}
export type SponsorImportStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export interface SponsorImportRow {
  rowNumber: number
  payrollNumber: string
  excelName: string
  catalogName: string | null
  status: SponsorImportStatus
  message: string | null
}
export interface SponsorImportPreview {
  totalRows: number
  newAccounts: number
  skippedAccounts: number
  errorRows: number
  rows: SponsorImportRow[]
}
export interface SponsorImportResult {
  totalRows: number
  createdAccounts: number
  skippedAccounts: number
}
