# EmpleadoDelMes — Frontend

Aplicación web desarrollada con React, TypeScript, Vite y
Tailwind CSS.

## Estado

En desarrollo. La estructura técnica está preparada.
Las funcionalidades de negocio se definirán posteriormente.

## Tecnologías

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- React Router
- ESLint y Prettier
- Vitest

## Requisitos

- Node.js 24 LTS
- npm
- Git

## Instalación

```powershell
npm ci
```

## Desarrollo local

```powershell
npm run dev
```

## Variables de entorno

El archivo .env.development contiene la dirección local de la API.

Variables:

- VITE_APP_NAME
- VITE_API_BASE_URL

No almacenar secretos en variables VITE_*.

## Verificaciones

```powershell
npm run format:check
npm run lint
npm run build
npm run test
```

## Arquitectura

- src/app: configuración global.
- src/pages: páginas.
- src/features: funcionalidades.
- src/shared: código reutilizable.
- src/assets: recursos estáticos.

## Despliegue

Pendiente de configuración.

Destino previsto: Azure Static Web Apps.
CI/CD: GitHub Actions.

## Licencia

Proyecto interno. Permisos de distribución pendientes
de definición por la organización.
