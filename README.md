# Sistema Académico UNICEN

Aplicación académica con frontend React/MUI, API NestJS y PostgreSQL. La autenticación utiliza JWT en una cookie `HttpOnly`; la autorización se verifica en la API.

## Tecnologías

- Frontend: React 19, TypeScript, Vite, MUI 9 y TanStack Query.
- Backend: NestJS 12, TypeScript, TypeORM 1 y PostgreSQL.
- Contenedores: Docker Compose, PostgreSQL 16, Node.js 22 para la API y Nginx para servir el frontend.

## Requisitos

- Docker Desktop con Compose v2.
- Desarrollo local: Node.js 22.22.3+ para el backend y Node.js 20.19+ para el frontend.

## Inicio con Docker Compose

1. Copia `.env.example` como `.env` en la raíz y revisa sus valores de desarrollo. Reemplaza las contraseñas y secretos antes de cualquier despliegue.
2. Construye e inicia los servicios:

   ```powershell
   docker compose up --build
   ```

3. Abre:
   - Frontend: `http://localhost:8080`
   - Salud de API: `http://localhost:3000/health`
   - PostgreSQL desde el host: puerto `5433`

La API aplica las migraciones pendientes al iniciar (`migrationsRun: true`). Antes de conectarla a una base existente, realiza y verifica una copia de seguridad. Compose conserva los datos en `postgres_data`; no uses `docker compose down -v` salvo que realmente quieras borrar ese volumen.

Compose requiere configurar `DEV_ADMIN_EMAIL`, `DEV_ADMIN_NAME` y `DEV_ADMIN_PASSWORD` (mínimo 12 caracteres) y los usa para crear un administrador inicial en entornos no productivos. El backend local también puede ejecutarse sin crear esa cuenta si se omiten las tres variables; si se configura alguna, deben configurarse todas. El seed no sobrescribe una cuenta existente y no se ejecuta con `NODE_ENV=production`.

## Desarrollo local

Configura `backend/.env` con conexión PostgreSQL, `JWT_SECRET` de al menos 32 caracteres y los orígenes permitidos en `CORS_ORIGINS`. Antes de iniciar Vite, crea el archivo local de configuración del frontend desde la plantilla:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

`frontend/.env.example` establece `VITE_API_URL=http://localhost:3000`. Vite incorpora esta variable al iniciar/desarrollar y al compilar; reinicia el servidor de desarrollo después de cambiarla. En Docker Compose, el valor se pasa como argumento de build del frontend (`VITE_API_URL`, predeterminado `http://localhost:3000`), que debe ser accesible desde el navegador.

```powershell
Set-Location backend
npm ci
npm run start:dev
```

En otra terminal:

```powershell
Set-Location frontend
npm ci
npm run dev
```

La interfaz local se sirve por defecto en `http://localhost:5173`. El backend local usa PostgreSQL en `localhost:5433` según `backend/.env.example`.

## Funcionalidad disponible

- Autenticación por cookie JWT, cierre de sesión y consulta del usuario actual.
- Cuentas con roles `admin`, `teacher` y `student`; administración puede registrar docentes y consultar las cuentas disponibles para asignaciones.
- CRUD de materias, cursos y perfiles de estudiantes en la API.
- Gestión de periodos académicos identificados por código (por ejemplo, `2026-1`), con fechas `timestamptz` y estado habilitado.
- Oferta de cursos, gestión administrativa de cupos y asignación de docentes desde cuentas existentes.
- Inscripciones propias para estudiantes, consulta de inscripciones asignadas para docentes y administración global para administradores.
- Cancelación y reactivación conservando el registro; restricciones de unicidad y capacidad máxima.
- Excepciones administrativas fuera de las fechas con motivo obligatorio y auditoría. Una gestión deshabilitada y el límite de cupo no pueden exceptuarse.
- Calificaciones de 0 a 100, únicamente por el docente asignado y sobre inscripciones activas. Se conserva la última nota y se registra cada creación/corrección en auditoría.
- Historial académico con inscripciones activas y canceladas y la calificación vigente cuando existe.
- Consulta administrativa de los 100 eventos de auditoría más recientes.

Los horarios de gestión se ingresan y se presentan en `America/La_Paz`. El inicio es inclusivo y el cierre exclusivo; la comparación en el servidor se realiza sobre instantes con zona/offset explícito.

## API principal

| Ruta | Acceso |
|---|---|
| `GET /health` | Público |
| `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Autenticación |
| `GET /auth/users`, `POST /auth/users` | Administrador |
| `/subjects` | Lectura autenticada; escritura administrador |
| `/courses` | Lectura autenticada; escritura administrador |
| `/students` | Lista para admin/docente; perfil propio para estudiante; escritura administrador |
| `/academic-periods` | Lectura autenticada; configuración administrador |
| `/enrollments` | Consulta limitada por rol; alta propia de estudiante o gestión admin; cancelación propia o admin |
| `/grades` | Lectura limitada por rol; escritura del docente asignado |
| `/academic-history/me` | Estudiante autenticado |
| `/academic-history/students/:studentId` | Administrador o docente (solo sus cursos) |
| `GET /audit-logs` | Administrador |

## Arquitectura

- Frontend organizado por funcionalidades bajo `frontend/src/features/`, con TanStack Query para estado remoto.
- Backend organizado en módulos NestJS con capas `presentation`, `domain` y `data`.
- Repositorios encapsulan persistencia; servicios aplican reglas y permisos de negocio.
- Inscripción, cancelación, reactivación, actualización de cupo y auditoría se coordinan en transacciones. Las operaciones de inscripción bloquean la fila del curso para serializar solicitudes concurrentes; la restricción única de PostgreSQL protege adicionalmente contra duplicados.
- No se usa un algoritmo de nota configurable: la escala confirmada es fija, de 0 a 100.

## Validaciones

Desde las carpetas correspondientes:

```powershell
Set-Location backend
npm run build
npm test
npm run lint
```

```powershell
Set-Location frontend
npm run build
npm test
npm run lint
```

Las pruebas unitarias no requieren iniciar la base. No se debe ejecutar `npm run test:e2e` contra una base con datos reales sin revisar primero su configuración: la API tiene migraciones automáticas habilitadas.

## Limitaciones conocidas

- La base persistente de este entorno no fue migrada ni modificada durante la implementación; el esquema debe verificarse en una base desechable o respaldada antes de un despliegue.
- No se ejecutó una prueba de concurrencia contra PostgreSQL real; la consistencia se implementa con transacciones, bloqueo de fila y restricciones de base.
- El frontend cubre los flujos principales, pero algunas operaciones administrativas de edición/eliminación disponibles en la API aún no tienen formularios dedicados.
- El build de Vite advierte que el bundle inicial supera 500 kB; puede reducirse después mediante separación de páginas.
