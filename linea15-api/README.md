# Línea 1.5 — Backend API

API REST para la aplicación de Gestión de Riesgos Tecnológicos.

## Stack
- **Runtime:** Node.js (Vercel Serverless Functions)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth + JWT

## Endpoints

### Auth
| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con email/password |
| POST | `/api/auth/logout` | Cerrar sesión |
| POST | `/api/auth/recovery` | Recuperar contraseña |
| GET | `/api/auth/me` | Verificar sesión actual |

### Projects
| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/projects` | Listar proyectos activos |
| POST | `/api/projects` | Crear proyecto con controles |
| PUT | `/api/projects/:id` | Finalizar (archivar) proyecto |
| DELETE | `/api/projects/:id` | Eliminar proyecto |

### Controls
| Method | Endpoint | Descripción |
|--------|----------|-------------|
| PUT | `/api/controls/:id` | Actualizar cumplimiento |

### Evidences
| Method | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/evidences` | Crear evidencia + archivos |
| PUT | `/api/evidences/:id` | Aprobar/rechazar/editar |
| DELETE | `/api/evidences/:id` | Eliminar evidencia + archivos |

### Users (Admin only)
| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Editar/toggle/permisos |
| DELETE | `/api/users/:id` | Eliminar usuario |

### Logs (Admin only)
| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/logs` | Listar logs de auditoría |
| POST | `/api/logs` | Registrar log |

### Archive
| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/archive` | Listar matrices archivadas |

## Setup

### 1. Crear proyecto en Supabase
1. Ve a https://supabase.com/dashboard
2. New Project → nombre: `linea15`
3. Ejecuta el SQL schema (ver archivo `supabase-schema.sql`)
4. Crea usuarios en Authentication → Add user

### 2. Configurar Vercel
1. Importa este repo en Vercel
2. Ve a Settings → Environment Variables
3. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (service_role key, SECRET) |
| `SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `FRONTEND_URL` | `https://tu-frontend.vercel.app` |

### 3. Deploy
```bash
git push
```
Vercel despliega automáticamente.

### 4. Probar
```bash
# Login
curl -X POST https://tu-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linea15.app","password":"Admin123!"}'

# Listar proyectos (con token)
curl https://tu-api.vercel.app/api/projects \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## Seguridad
- JWT validation en todos los endpoints
- Admin guard para gestión de usuarios
- Account lockout (5 intentos → 15 min bloqueo)
- Audit logging de todas las acciones
- CORS configurado
- service_role key solo en server-side (nunca expuesto al cliente)
