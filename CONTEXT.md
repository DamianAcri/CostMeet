# 🪪 Nombre del proyecto

**CostMeet**

Herramienta SaaS minimalista que calcula el coste real de las reuniones en euros, dólares (o la moneda que elija el usuario)... ayudando a las empresas a tomar decisiones basadas en datos y optimizar su tiempo y recursos.

---

# 🎯 Propósito

Reducir el despilfarro de tiempo y dinero en reuniones innecesarias o sobredimensionadas proporcionando visibilidad clara sobre su coste.

---

# 🧠 Problema que resuelve

* Las reuniones consumen miles de euros al mes sin aportar valor real.
* Muchas empresas no son conscientes de su coste en tiempo y dinero.
* No hay herramientas simples que muestren esta información de forma clara y accionable.

---

# 👥 Target

* Startups y PYMEs entre 10 y 250 empleados.
* Fundadores, managers, product owners.
* Equipos que usan Google Calendar y se preocupan por su eficiencia.

---

# 💡 Propuesta de valor

* Calcula el coste de cada reunión.
* Dashboards semanales y mensuales con resumen del gasto.
* Alertas configurables cuando se supera un umbral.
* Rankings de reuniones más caras.
* Conciencia inmediata sobre si una reunión debería o no hacerse.

---

# ⚙️ MVP - ESTADO ACTUAL: ✅ COMPLETADO

## Funcionalidades implementadas:

1. ✅ Login con Google (OAuth) + Email/Password
2. ✅ Crear reunión manualmente
   * Nº de asistentes (1-100)
   * Duración en minutos (1-1440)
   * Salario medio estimado (0-10,000)
   * Fecha personalizable
   * Descripción opcional
3. ✅ Cálculo del coste en tiempo real
4. ✅ Guardado de reuniones en Supabase
5. ✅ Dashboard completo:
   * Total gastado semanalmente
   * Total de reuniones semanales
   * Coste promedio por reunión
   * Total histórico de reuniones y costes
   * Lista de reuniones ordenadas por fecha
   * Edición y eliminación de reuniones
6. ✅ Interfaz responsive y moderna
7. ✅ Actualizaciones automáticas sin recargar página
8. ✅ Gestión de perfiles de usuario

## Arquitectura técnica implementada:

### 🏗️ **ESTRUCTURA DEL PROYECTO**
```
src/
├── app/                 # App Router de Next.js
├── components/          # Componentes reutilizables
├── contexts/           # Context API para autenticación
├── hooks/              # Custom hooks (useMeetings)
├── lib/                # Utilidades y configuraciones
└── public/             # Archivos estáticos
```

### 🔐 **AUTENTICACIÓN Y SEGURIDAD**
- Supabase Auth con OAuth (Google) y email/password
- Row Level Security (RLS) implementado
- Validación de variables de entorno
- Gestión centralizada de errores
- Logs protegidos para producción

### 📊 **BASE DE DATOS**
- PostgreSQL con Supabase
- Tablas: `profiles` y `meetings`
- Columna generada automáticamente para `total_cost`
- Triggers para `updated_at`
- Políticas de seguridad RLS

### 🎨 **COMPONENTES PRINCIPALES**
- `AuthContext`: Gestión centralizada de autenticación
- `useMeetings`: Hook personalizado para CRUD de reuniones
- `ProtectedRoute`: Protección de rutas
- `NewMeetingForm`: Formulario de creación con validación
- `EditMeetingModal`: Modal de edición
- `MeetingsList`: Lista de reuniones
- `StatsCards`: Tarjetas de estadísticas

### 🚀 **FUNCIONALIDADES AVANZADAS**
- Actualizaciones optimistas (UI se actualiza inmediatamente)
- Cálculo de costes en tiempo real
- Validación de formularios con mensajes de error
- Manejo de estados de carga
- Responsive design con TailwindCSS
- Sin valores hardcodeados (todo en constantes)

---

# 📦 Stack recomendado

* **Frontend**: Next.js + TailwindCSS
* **Backend**: Next.js API routes (o Supabase functions si todo en Supabase)
* **Base de datos**: Supabase (PostgreSQL)
* **Auth**: Supabase OAuth (Google)
* **Gráficas**: Recharts
* **Deploy**: Vercel

---

# 💸 Monetización futura

**Modelo Freemium**

* Free: Hasta 10 reuniones al mes
* Pro: 9€/mes (100 reuniones, sync con calendario)
* Business: 29€/mes (ilimitado, export PDF, multiusuario)

**Objetivo inicial:**
25 clientes Pro → 225€/mes
50 clientes Pro → 450€/mes

---

# 🛣️ Roadmap resumido

| Día    | Acciones                                     |
| ------ | -------------------------------------------- |
| 1      | MVP básico: auth, crear reuniones, dashboard |
| 2      | Deploy + feedback temprano                   |
| 3      | Mejora UI + alertas                          |
| 4      | Mini lanzamiento LinkedIn + feedback         |

---

# 📲 UI inicial (después de login)

* Dashboard central:

  * Total gastado esta semana (número grande)
  * Lista de reuniones recientes
  * Botón "+ Nueva reunión"

* Menú lateral:

  * Historial
  * Ranking
  * Ajustes

Minimal, claro, muy enfocado en acción y visualización inmediata.

---

# ✅ Objetivo de Damian

Construir el MVP funcional de CostMeet en 3-5 días, ponerlo en producción (Vercel), recibir feedback y validar si tiene tracción para evolucionar a versión Pro.

---

# 🏗️ Arquitectura Implementada

## 📁 Estructura de Carpetas Creadas

### `/src/lib/`
- **`supabase/client.ts`** - Cliente de Supabase con validación de variables de entorno
- **`supabase/types.ts`** - Tipos TypeScript para las tablas de la base de datos (sin duplicación de cliente)
- **`constants.ts`** - Constantes centralizadas para configuración, rutas y validaciones

### `/src/contexts/`
- **`AuthContext.tsx`** - Context centralizado para manejo de autenticación

### `/src/components/`
- **`ProtectedRoute.tsx`** - Componentes para protección de rutas

### `/src/app/login/`
- **`page.tsx`** - Página de inicio de sesión

### `/src/app/dashboard/`
- **`page.tsx`** - Dashboard principal (área privada)

## 🗄️ Base de Datos (Supabase)

### Tabla: `profiles`
```sql
-- Extiende auth.users de Supabase
id: uuid (PK, FK a auth.users)
email: text
full_name: text
avatar_url: text
currency: text (default 'EUR')
default_hourly_rate: numeric (default 50.00)
company_name: text
created_at: timestamp
updated_at: timestamp
```

**Políticas RLS:**
- Users can view own profile
- Users can update own profile  
- Users can insert own profile

### Tabla: `meetings`
```sql
id: uuid (PK)
user_id: uuid (FK a profiles)
title: text (required)
description: text
attendees_count: integer (required, > 0)
duration_minutes: integer (required, > 0)
average_hourly_rate: numeric (required, > 0)
total_cost: numeric (calculado automáticamente)
currency: text (default 'EUR')
meeting_date: timestamp
created_at: timestamp
updated_at: timestamp
```

**Políticas RLS:**
- Users can view own meetings
- Users can insert own meetings
- Users can update own meetings
- Users can delete own meetings

**Cálculo automático:**
`total_cost = (attendees_count * average_hourly_rate * duration_minutes) / 60.0`

### Función: `handle_new_user()`
Trigger que crea automáticamente un perfil cuando se registra un usuario.

## 🔐 Sistema de Autenticación Centralizado

### AuthContext (`/src/contexts/AuthContext.tsx`)

**Estados:**
- `user: User | null` - Usuario actual de Supabase
- `profile: Profile | null` - Perfil extendido del usuario
- `session: Session | null` - Sesión actual
- `loading: boolean` - Estado de carga

**Métodos:**
- `signInWithEmail(email, password)` - Inicio de sesión con email/contraseña
- `signUpWithEmail(email, password, fullName)` - Registro con email/contraseña
- `signInWithGoogle()` - Inicio de sesión con Google OAuth (opcional)
- `signOut()` - Cerrar sesión
- `updateProfile(updates)` - Actualizar perfil del usuario
- `resetPassword(email)` - Recuperar contraseña por email
- `fetchProfile(userId)` - Obtener perfil del usuario
- `createProfile(userId)` - Crear perfil manualmente si no existe

**Funcionalidades:**
- ✅ Sincronización automática con Supabase auth
- ✅ Manejo de estados de carga
- ✅ Persistencia de sesión
- ✅ Actualización automática de perfil
- ✅ Creación automática de perfil si falla el trigger
- ✅ Logs condicionales (solo en desarrollo)
- ✅ Constantes centralizadas para rutas y configuración
- ✅ Validación robusta de errores

### Componentes de Protección (`/src/components/ProtectedRoute.tsx`)

**`ProtectedRoute`:**
- Protege rutas que requieren autenticación
- Redirige a `/login` si no hay usuario
- Muestra spinner de carga durante verificación

**`PublicRoute`:**
- Protege rutas públicas (login, registro)
- Redirige a `/dashboard` si ya hay usuario autenticado
- Evita que usuarios logueados vean páginas de login

## 📄 Páginas Implementadas

### `/src/app/page.tsx` (Home)
- **Función:** Redirige automáticamente según estado de auth
- **Lógica:** 
  - Usuario logueado → `/dashboard`
  - Usuario no logueado → `/login`
  - Muestra spinner durante verificación

### `/src/app/login/page.tsx`
- **Protección:** `PublicRoute` (solo no autenticados)
- **Funcionalidades:**
  - 🔑 **Login con Email/Contraseña** (principal)
  - 🟢 **Registro con Email/Contraseña**
  - 📧 **Recuperación de contraseña**
  - 🔵 **Login con Google** (opcional)
  - Cambio dinámico entre modos (login/signup/reset)
  - Validación de formularios
  - Manejo de errores específicos
  - Estados de carga
  - UI moderna y accesible

### `/src/app/dashboard/page.tsx`
- **Protección:** `ProtectedRoute` (solo autenticados)
- **Funcionalidades:**
  - Header con avatar y botón logout
  - Cards de estadísticas (esta semana, reuniones, promedio)
  - Botones de acción rápida
  - Lista de reuniones recientes (vacía inicialmente)

### `/src/app/layout.tsx`
- **Actualizado con:**
  - `AuthProvider` envolviendo toda la app
  - Metadata actualizada para CostMeet
  - Idioma español

## 🔧 Configuración y Mejoras Implementadas

### Variables de Entorno (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jlurakrexxvcckcogtuf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**✅ Validación automática:** El cliente Supabase valida que las variables existan

### Constantes Centralizadas (`/src/lib/constants.ts`)
- **AUTH_CONFIG:** Rutas, códigos de error, configuración por defecto
- **VALIDATION_RULES:** Reglas de validación para formularios
- **Elimina hardcodeo:** Todas las rutas y valores están centralizados

### Dependencias Instaladas
- `@supabase/supabase-js` - Cliente de Supabase
- `@heroicons/react` - Iconos
- `lucide-react` - Iconos adicionales

### Mejoras de Seguridad y Calidad
- ✅ **Sin duplicación de cliente Supabase**
- ✅ **Validación de variables de entorno**
- ✅ **Constantes centralizadas** (no más hardcodeo)
- ✅ **Manejo robusto de errores** con mensajes específicos
- ✅ **Logs condicionales** (solo en desarrollo)
- ✅ **Validaciones de formulario** mejoradas
- ✅ **Fallback de creación de perfil** manual
- ✅ **Tipos TypeScript** completos y limpios

## 🎯 Estado Actual del MVP

### ✅ Completado (v1.0 - Ready for Production)
1. **Autenticación centralizada** - Sistema robusto, escalable y sin hardcodeo
2. **Base de datos** - Esquema completo con RLS y trigger automático
3. **Rutas protegidas** - Navegación segura con constantes centralizadas
4. **UI base** - Login y Dashboard funcionales con manejo de errores mejorado
5. **Tipos TypeScript** - Tipado completo de BD sin duplicaciones
6. **Validaciones robustas** - Formularios con validación y feedback específico
7. **Fallbacks de seguridad** - Creación manual de perfil si falla el trigger
8. **Código limpio** - Sin hardcodeo, constantes centralizadas, logs condicionales

### 🔄 Próximo (Pendiente)
1. **Formulario crear reunión** - CRUD de meetings
2. **Cálculos en tiempo real** - Dashboard con datos reales
3. **Reportes y estadísticas** - Análisis de costos
4. **Exportación** - CSV/PDF de reportes

## 🛠️ Flujos de Autenticación

### Opción 1: Email/Contraseña (Principal)
1. **Usuario no autenticado** → Página `/` → Redirect a `/login`
2. **Formulario dinámico** → Registro/Login/Reset según modo seleccionado
3. **Supabase auth** → Validación y procesamiento
4. **Trigger automático** → Crea perfil en tabla `profiles`
5. **AuthContext actualiza** → `user`, `profile`, `session`
6. **Usuario autenticado** → Redirect a `/dashboard`

### Opción 2: Google OAuth (Alternativa)
1. **Click "Login con Google"** → OAuth Google → Callback a `/dashboard`
2. **Resto igual** que opción 1

### Recuperación de Contraseña
1. **Modo reset** → Ingresa email → **Supabase envía email de recuperación**
2. **Usuario hace click** → Enlace redirige a página de reset
3. **Nueva contraseña** → Login automático

### Logout
- **Logout** → Limpia estados del AuthContext → Redirect a `/login`

---

## 🆘 Configuración de Supabase Requerida

### 1. Ejecutar SQL (en SQL Editor de Supabase)
```sql
-- Copiar y ejecutar todas las consultas SQL de las tablas mencionadas arriba
-- Incluir: profiles, meetings, handle_new_user function y trigger
```

### 2. Configurar Auth
- **Email Auth:** ✅ Habilitado por defecto en Supabase
- **Google OAuth:** ⚙️ Opcional - Si quieres mantener Google como alternativa
  - En Authentication > Providers > Google
  - Configurar Client ID y Secret de Google Console

### 3. Email Templates (Opcional)
- En Authentication > Email Templates
- Personalizar emails de confirmación y reset de contraseña

---
