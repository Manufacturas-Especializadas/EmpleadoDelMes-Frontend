import { ImportWorkflow } from '../components/ImportWorkflow'
import { PreviewTable } from '../components/PreviewTable'
import { employeeImports, sponsorImports } from '../importsApi'
import { StatusBadge } from '@/shared/components/StatusBadge'
const sponsorStatusLabels = [
  'Lista para crear',
  'Patrocinador existente: omitido',
  'Patrocinador inactivo: omitido',
  'Empleado no encontrado',
  'Nómina duplicada',
  'Nombre diferente',
  'Conflicto de cuenta',
  'Datos inválidos',
]
export function EmployeeImportPage() {
  return (
    <ImportWorkflow
      title="Importación de empleados"
      service={employeeImports}
      canConfirm={(preview) => preview.totalRows > 0 && preview.invalidRows === 0}
      renderPreview={(preview) => (
        <>
          <p>
            Total: {preview.totalRows} · Válidas: {preview.validRows} · Inválidas:{' '}
            {preview.invalidRows} · Nuevas: {preview.newRows} · Existentes: {preview.existingRows}
          </p>
          <PreviewTable
            rows={preview.rows}
            columns={[
              { id: 'row', header: 'Fila', cell: (row) => row.rowNumber },
              { id: 'payroll', header: 'Nómina', cell: (row) => row.payrollNumber },
              { id: 'name', header: 'Nombre completo', cell: (row) => row.fullName },
              {
                id: 'status',
                header: 'Estado',
                cell: (row) => (
                  <StatusBadge
                    tone={!row.isValid ? 'danger' : row.existsInDatabase ? 'neutral' : 'success'}
                  >
                    {!row.isValid ? 'Inválida' : row.existsInDatabase ? 'Existente' : 'Nueva'}
                  </StatusBadge>
                ),
              },
              { id: 'errors', header: 'Errores', cell: (row) => row.errors.join(' ') },
            ]}
          />
        </>
      )}
      renderResult={(result) => (
        <>
          <p>{result.message}</p>
          <p>
            Total: {result.totalRows} · Insertadas: {result.insertedRows} · Existentes omitidas:{' '}
            {result.skippedExistingRows}
          </p>
        </>
      )}
    />
  )
}
export function SponsorImportPage() {
  return (
    <ImportWorkflow
      title="Importación de patrocinadores"
      service={sponsorImports}
      canConfirm={(preview) => preview.totalRows > 0 && preview.errorRows === 0}
      renderPreview={(preview) => (
        <>
          <p>
            Total: {preview.totalRows} · Nuevas cuentas: {preview.newAccounts} · Omitidas:{' '}
            {preview.skippedAccounts} · Errores: {preview.errorRows}
          </p>
          <PreviewTable
            rows={preview.rows}
            columns={[
              { id: 'row', header: 'Fila', cell: (row) => row.rowNumber },
              { id: 'payroll', header: 'Nómina', cell: (row) => row.payrollNumber },
              { id: 'excel', header: 'Nombre Excel', cell: (row) => row.excelName },
              {
                id: 'catalog',
                header: 'Nombre catálogo',
                cell: (row) => row.catalogName ?? 'No encontrado',
              },
              {
                id: 'status',
                header: 'Estado',
                cell: (row) => (
                  <StatusBadge
                    tone={row.status === 0 ? 'success' : row.status < 3 ? 'neutral' : 'danger'}
                  >
                    {sponsorStatusLabels[row.status]}
                  </StatusBadge>
                ),
              },
              {
                id: 'message',
                header: 'Mensaje',
                cell: (row) => row.message ?? 'Sin observaciones',
              },
            ]}
          />
        </>
      )}
      renderResult={(result) => (
        <>
          <p>
            Importación terminada. Total: {result.totalRows} · Cuentas creadas:{' '}
            {result.createdAccounts} · Omitidas: {result.skippedAccounts}
          </p>
          <p>
            Esta operación no devuelve contraseñas temporales individuales. Las cuentas inactivas no
            se reactivan.
          </p>
        </>
      )}
    />
  )
}
