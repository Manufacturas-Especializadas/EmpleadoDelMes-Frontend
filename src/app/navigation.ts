export const adminModules = [
  {
    path: '/admin/campaigns',
    label: 'Convocatorias',
    group: 'Proceso de reconocimiento',
    description: 'Consulta los periodos y administra las convocatorias mensuales.',
  },
  {
    path: '/admin/nominations',
    label: 'Postulaciones',
    group: 'Proceso de reconocimiento',
    description: 'Consulta, corrige o anula postulaciones con un motivo registrado.',
  },
  {
    path: '/admin/preselections',
    label: 'Preselección',
    group: 'Proceso de reconocimiento',
    description: 'Revisa los candidatos y administra su preselección.',
  },
  {
    path: '/admin/review',
    label: 'Revisión integral',
    group: 'Proceso de reconocimiento',
    description: 'Consulta postulaciones y opiniones departamentales por candidato.',
  },
  {
    path: '/admin/employees',
    label: 'Empleados',
    group: 'Administración',
    description: 'Consulta y administra el catálogo de empleados.',
  },
  {
    path: '/admin/users',
    label: 'Usuarios y accesos',
    group: 'Administración',
    description: 'Administra cuentas de patrocinadores y departamentos.',
  },
  {
    path: '/admin/imports/employees',
    label: 'Importaciones de empleados',
    group: 'Administración',
    description: 'Valida un archivo Excel antes de importar empleados.',
  },
  {
    path: '/admin/imports/sponsors',
    label: 'Importaciones de patrocinadores',
    group: 'Administración',
    description: 'Revisa y confirma la importación de patrocinadores.',
  },
]
