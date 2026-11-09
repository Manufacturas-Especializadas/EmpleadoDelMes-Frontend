import type { IconName } from '@/shared/components/Icon'
export const sponsorModules = [{ path: '/sponsor/my-employees', label: 'Mis colaboradores' }]
export const adminModules = [
  {
    path: '/admin/sponsor-assignments',
    label: 'Asignación de colaboradores',
    group: 'Administración',
    description: 'Asigna, reasigna o retira colaboradores de cada patrocinador.',
  },
  {
    path: '/admin/settings/campaign-automation',
    label: 'Automatización de convocatorias',
    group: 'Configuración',
    description: 'Configura el calendario mensual y revisa su estado de ejecución.',
  },
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

export function navigationIcon(path: string): IconName {
  if (path.includes('sponsor-assignments')) return 'users'
  if (path.includes('settings')) return 'calendar'
  if (path.includes('imports')) return 'file'
  if (path.includes('campaigns')) return 'calendar'
  if (path.includes('preselections')) return 'checkUser'
  if (path.includes('review')) return 'review'
  if (path.includes('employees')) return 'users'
  if (path.includes('users')) return 'shield'
  if (path.includes('nominations') || path === '/sponsor') return 'clipboard'
  if (path === '/change-password') return 'lock'
  if (['/human-resources', '/safety', '/quality'].includes(path)) return 'message'
  return 'home'
}

export const recognitionRoles = ['Administrator', 'Organizer']
export function managementModules(roles: string[]) {
  if (roles.includes('Administrator')) return adminModules
  return roles.includes('Organizer')
    ? adminModules.filter((item) => item.group === 'Proceso de reconocimiento')
    : []
}
