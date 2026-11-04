import { SuccessMessage } from '@/shared/components/SuccessMessage'
import { useState, type ReactNode } from 'react'
import { useOperation } from '@/shared/hooks/useOperation'
import { PageHeader } from '@/shared/components/PageHeader'
import { TextField } from '@/shared/components/TextField'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
export function ImportWorkflow<P, R>({
  title,
  service,
  canConfirm,
  renderPreview,
  renderResult,
}: {
  title: string
  service: {
    preview: (file: File, signal: AbortSignal) => Promise<P>
    confirm: (file: File, signal: AbortSignal) => Promise<R>
  }
  canConfirm: (preview: P) => boolean
  renderPreview: (preview: P) => ReactNode
  renderResult: (result: R) => ReactNode
}) {
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState<P | null>(null),
    [result, setResult] = useState<R | null>(null),
    [fileError, setFileError] = useState(''),
    [confirm, setConfirm] = useState(false)
  const operation = useOperation()
  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description="Excel .xlsx, máximo 5 MB y 1,000 registros. La validación de contenido corresponde al servidor."
      />
      <p className="detail-card text-sm leading-6 text-muted">
        Primera hoja, encabezados Nómina y Nombre completo. También se aceptan Número de nómina,
        Número nómina, PayrollNumber; Nombre o FullName. Conserva las nóminas como texto y no uses
        fórmulas.
      </p>
      <TextField
        label="Archivo Excel"
        type="file"
        accept=".xlsx"
        disabled={operation.busy}
        onChange={(event) => {
          const next = event.target.files?.[0] ?? null
          setPreview(null)
          setResult(null)
          setConfirm(false)
          operation.clearError()
          const error =
            next &&
            (!/\.xlsx$/i.test(next.name)
              ? 'Solo se permiten archivos .xlsx.'
              : next.size === 0
                ? 'Selecciona un archivo con contenido.'
                : next.size > 5 * 1024 * 1024
                  ? 'El archivo no puede superar 5 MB.'
                  : '')
          setFileError(error || '')
          setFile(error ? null : next)
        }}
      />
      {fileError && <p role="alert">{fileError}</p>}
      <button
        className="primary"
        disabled={!file || operation.busy}
        onClick={() =>
          void operation.run(async (signal) => {
            if (file) {
              setPreview(null)
              setResult(null)
              const value = await service.preview(file, signal)
              if (!signal.aborted) setPreview(value)
            }
          })
        }
      >
        Consultar vista previa
      </button>
      {operation.busy && <LoadingState variant="compact" message="Procesando archivo…" />}
      {operation.error && (
        <p role="alert" className="text-red-700">
          {operation.error}
        </p>
      )}
      {preview !== null && (
        <>
          {renderPreview(preview)}
          {!canConfirm(preview) && (
            <p role="alert">Corrige las filas con errores y consulta una nueva vista previa.</p>
          )}
          <button
            className="primary"
            disabled={operation.busy || !canConfirm(preview)}
            onClick={() => setConfirm(true)}
          >
            Confirmar importación
          </button>
        </>
      )}
      {result !== null && <SuccessMessage>{renderResult(result)}</SuccessMessage>}
      <ConfirmDialog
        open={confirm}
        title="Confirmar importación"
        description={`Se enviará nuevamente el archivo ${file?.name ?? ''}. El servidor volverá a validar los datos antes de guardar.`}
        busy={operation.busy}
        error={operation.error}
        onCancel={() => setConfirm(false)}
        onConfirm={() =>
          void operation.run(async (signal) => {
            if (!file || !preview || !canConfirm(preview)) return
            try {
              const value = await service.confirm(file, signal)
              if (!signal.aborted) {
                setResult(value)
                setPreview(null)
                setConfirm(false)
              }
            } catch (error) {
              setPreview(null)
              setConfirm(false)
              throw error
            }
          })
        }
      />
    </div>
  )
}
