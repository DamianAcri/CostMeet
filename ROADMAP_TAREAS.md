# 🚀 COSTMEET - ROADMAP DE TAREAS

## 📋 ESTADO ACTUAL (COMPLETADO)
- ✅ Dashboard básico con 4 KPIs (coste esta semana, coste promedio, nº de reuniones, coste total)
- ✅ Listado CRUD de reuniones creadas manualmente
- ✅ Formulario que calcula el coste estimado a partir de asistentes, duración y tarifa/hora
- ✅ Autenticación con Google OAuth y email/password
- ✅ Base de datos con RLS y actualizaciones en tiempo real
- ✅ UI responsive y moderna

---

## 🎯 FASE 1: ELIMINAR FRICCIÓN MANUAL
**Objetivo:** Sincronización automática con calendarios  
**Esfuerzo:** 1-2 días  
**Valor:** Ahorro de tiempo + datos reales = confianza

### Tareas técnicas:
- [ ] **Setup Google Calendar API**
  - [ ] Configurar Google Cloud Console
  - [ ] Añadir scopes de lectura de calendario
  - [ ] Implementar OAuth para Calendar API

- [ ] **Backend de sincronización**
  - [ ] Crear tabla `calendar_connections` (user_id, provider, access_token, refresh_token)
  - [ ] Endpoint para conectar/desconectar calendario
  - [ ] Función para importar eventos de calendario
  - [ ] Job diario/horario para mantener sincronizado

- [ ] **UI de conexión**
  - [ ] Botón "Conectar Google Calendar" en Dashboard
  - [ ] Modal de configuración de importación
  - [ ] Estado de conexión y última sincronización
  - [ ] Opción para elegir qué calendarios importar

- [ ] **Mapeo de datos**
  - [ ] Convertir eventos de Calendar API a formato Meeting
  - [ ] Detectar asistentes automáticamente
  - [ ] Calcular duración desde start/end time
  - [ ] Manejar eventos recurrentes

### Quick-wins de UX:

- [ ] **Hacer KPIs clicables**
  - [ ] "Coste esta semana" → lista filtrada de reuniones de esta semana
  - [ ] "Total reuniones" → vista completa
  - [ ] "Coste promedio" → gráfico de tendencias

---

## 🎯 FASE 2: CONTEXTO DE COSTE REAL
**Objetivo:** Perfiles de coste por usuario  
**Esfuerzo:** 1-2 días  
**Valor:** Costes creíbles sin teclear tarifas manualmente

### Tareas técnicas:
- [ ] **Sistema de perfiles de coste**
  - [ ] Añadir campos a `profiles`: `job_title`, `seniority_level`
  - [ ] Crear tabla `job_rates` (title, seniority, default_hourly_rate)
  - [ ] UI para configurar perfil personal
  - [ ] Admin UI para gestionar tarifas por rol

- [ ] **Autocompletado inteligente**
  - [ ] Detectar emails de asistentes en reuniones
  - [ ] Buscar tarifa por email en organización
  - [ ] Fallback a tarifa "Invitado externo" configurable
  - [ ] Sugerir tarifas basadas en dominio de email

- [ ] **Gestión de organizaciones**
  - [ ] Concepto de "workspace" u "organización"
  - [ ] Invitar miembros del equipo
  - [ ] Roles: Admin, Member
  - [ ] CSV upload para tarifas masivas

### UI/UX:
- [ ] **Sección Mi Perfil**
  - [ ] Configurar cargo y seniority
  - [ ] Establecer tarifa personal
  - [ ] Ver estadísticas personales

- [ ] **Gestión de equipo (Admin)**
  - [ ] Lista de miembros del equipo
  - [ ] Editar tarifas por persona
  - [ ] Importar CSV con emails + tarifas
  - [ ] Configurar tarifa para invitados externos

---

## 🎯 FASE 3: INSIGHTS ACCIONABLES
**Objetivo:** Alertas y contexto que generen cambio de comportamiento  
**Esfuerzo:** 3-4 días  
**Valor:** Prevención de reuniones innecesarias

### Tareas técnicas:
- [ ] **Panel de reuniones más caras**
  - [ ] Vista "Top 10 reuniones más caras de la semana"
  - [ ] Filtros por fecha, equipo, tipo
  - [ ] Ordenación por coste, duración, asistentes
  - [ ] Identificar patrones (reuniones recurrentes caras)

- [ ] **Sistema de alertas**
  - [ ] Configurar notificaciones por email
  - [ ] Alertas diarias/semanales de coste
  - [ ] Alertas pre-reunión (24h antes) con coste estimado
  - [ ] Configuración de umbrales personalizables

- [ ] **Integración Slack/Teams**
  - [ ] Webhook para notificaciones
  - [ ] Bot con comando `/meetingcost`
  - [ ] Alertas automáticas en canales
  - [ ] Sugerencias de acción (acortar, cancelar)

### Contenido de alertas:
- [ ] **Email diario/semanal**
  - [ ] Resumen de coste semanal
  - [ ] Top 3 reuniones más caras
  - [ ] Comparación con semana anterior
  - [ ] Sugerencias de optimización

- [ ] **Alertas pre-reunión**
  - [ ] "Mañana: 'Weekly Sync' → 560€ (8 asistentes × 70€/h)"
  - [ ] Botones de acción: [Acortar a 30 min] [Cancelar] [Reducir asistentes]
  - [ ] Historial de eficacia de la reunión

---

## 🎯 FASE 4: MEDIR AHORRO Y ROI
**Objetivo:** Demostrar valor económico del producto  
**Esfuerzo:** 2-3 días  
**Valor:** Justificación para pagar suscripción

### Tareas técnicas:
- [ ] **Histórico y tendencias**
  - [ ] Gráficos de coste por semana/mes
  - [ ] Comparativas temporales (últimas 4 semanas)
  - [ ] Identificar tendencias al alza/baja
  - [ ] Correlación con acciones tomadas

- [ ] **Objetivos de ahorro**
  - [ ] Configurar meta de reducción (ej: -15% horas/mes)
  - [ ] Tracking de progreso hacia objetivo
  - [ ] Cálculo de dinero ahorrado vs baseline
  - [ ] Reportes de ROI para management

- [ ] **Reportes ejecutivos**
  - [ ] PDF monthly report para directivos
  - [ ] Dashboard ejecutivo con KPIs clave
  - [ ] Comparativas por equipos
  - [ ] Recomendaciones automatizadas

### Métricas de ahorro:
- [ ] **Widget "Dinero ahorrado"**
  - [ ] Comparar mes actual vs baseline
  - [ ] Mostrar tendencia de mejora
  - [ ] Desglose por tipo de ahorro
  - [ ] Proyección anual de ahorro

---

## 🎯 FASE 5: VIRALIDAD Y ADOPCIÓN
**Objetivo:** Extensión que muestre costes en calendar invites  
**Esfuerzo:** 2 días  
**Valor:** Crecimiento viral orgánico

### Tareas técnicas:
- [ ] **Extensión Chrome/Browser**
  - [ ] Detectar Google Calendar en DOM
  - [ ] Añadir coste estimado al título: "📉 30€/15min"
  - [ ] Insertar info de coste en cuerpo del invite
  - [ ] Link a "Optimizar con CostMeet"

- [ ] **Integración nativa Calendar**
  - [ ] Webhook para eventos creados/modificados
  - [ ] Auto-actualizar description con coste
  - [ ] Sugerir reducción de duración/asistentes
  - [ ] Link para unirse a CostMeet

---

## 🎯 FASE 6: MÉTRICAS CUALITATIVAS (IA)
**Objetivo:** Cerrar el loop coste vs valor percibido  
**Esfuerzo:** 2-3 días  
**Valor:** Identificar reuniones inútiles automáticamente

### Tareas técnicas:
- [ ] **Post-meeting feedback**
  - [ ] Widget 1-click: "¿Fue útil? 👍/👎"
  - [ ] Escala 1-5 de utilidad percibida
  - [ ] Comentarios opcionales
  - [ ] Tracking por tipo de reunión

- [ ] **Análisis predictivo**
  - [ ] Correlación coste alto + baja utilidad
  - [ ] Score de "reunión candidata a eliminar"
  - [ ] Patrones por equipo/persona
  - [ ] Sugerencias automáticas de optimización

---

## 📈 MONETIZACIÓN
- [ ] **Plan Free:** 500€ coste/mes analizado
- [ ] **Plan Starter (19€/mes):** hasta 20 usuarios, alertas, Slack bot
- [ ] **Plan Business (49€/mes):** ilimitado, objetivos, reportes PDF

---

## 🔧 TAREAS TÉCNICAS TRANSVERSALES

### Infraestructura:
- [ ] **Cron jobs/Background tasks**
  - [ ] Setup de queue system (Redis + Bull/Agenda)
  - [ ] Jobs de sincronización calendario
  - [ ] Jobs de envío de alertas
  - [ ] Jobs de cálculo de métricas

- [ ] **Escalabilidad**
  - [ ] Rate limiting en APIs
  - [ ] Caching de datos frecuentes
  - [ ] Optimización de queries pesadas
  - [ ] CDN para assets estáticos

### Monitoring y Analytics:
- [ ] **Product Analytics**
  - [ ] Tracking de eventos clave (mixpanel/amplitude)
  - [ ] Funnel de onboarding
  - [ ] Retention metrics
  - [ ] Feature usage analytics

- [ ] **Technical Monitoring**
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring (New Relic/DataDog)
  - [ ] Uptime monitoring
  - [ ] Database performance

### Legal y Compliance:
- [ ] **GDPR/Privacy**
  - [ ] Privacy policy
  - [ ] Data deletion endpoints
  - [ ] Consent management
  - [ ] Data export functionality

- [ ] **Terms & Billing**
  - [ ] Terms of service
  - [ ] Stripe integration para subscriptions
  - [ ] Invoice generation
  - [ ] Usage-based billing

---

## 🎯 PRÓXIMOS 3 DÍAS RECOMENDADOS

### DÍA 1-2: Google Calendar Integration
1. Setup Google Calendar API y OAuth
2. Crear sistema de sincronización básico
3. UI para conectar calendario
4. Importar eventos y convertir a meetings

### DÍA 3: Quick Wins + Alertas básicas
1. Mejorar datos demo y UX
2. Top costly meetings view
3. Email alert básico diario
4. KPIs clicables

**Resultado:** MVP funcional que elimina entrada manual y muestra valor real con datos del calendario existente.

---

## ⚠️ GESTIÓN DE RIESGOS

### Riesgos identificados y estrategias de mitigación:

| Riesgo | Mitigación | Tareas asociadas |
|--------|------------|------------------|
| **"Solo es una métrica; no cambia el comportamiento"** | Fase 3-4: alertas + recomendaciones "Acorta a 30 min / cancela" y gráfico de € ahorrados para demostrar ROI | - [ ] Sistema de alertas accionables<br>- [ ] Widget "dinero ahorrado"<br>- [ ] Botones de acción directa |
| **Competidores grandes añaden lo mismo (Zoom, Google Workspace)** | Diferenciarse con análisis cross-suite (Google + Outlook + Slack) + histórico de ahorro + informes listos para CFO | - [ ] Integración multi-plataforma<br>- [ ] Reportes ejecutivos PDF<br>- [ ] Dashboard específico para CFO |
| **Adopción inicial depende de champions (Ops/Product)** | Plan Free suave (500€ coste analizado) + fricción cero: "Conecta tu Google Calendar en 30s" | - [ ] Onboarding de 30 segundos<br>- [ ] Plan Free generoso<br>- [ ] Demo automático con datos |
| **Datos de salario sensibles** | Uso de rangos salariales o "bandas" por puesto para evitar exponer sueldos exactos | - [ ] Sistema de bandas salariales<br>- [ ] Configuración por roles<br>- [ ] Privacy settings granulares |

### Tareas específicas de mitigación:

- [ ] **Onboarding ultra-rápido**
  - [ ] Tutorial de 30 segundos
  - [ ] Demo automático con datos fake
  - [ ] Un solo click para conectar calendario
  - [ ] Setup wizard minimalista

- [ ] **Diferenciación competitiva**
  - [ ] Análisis cross-suite (Google + Outlook + Slack + Teams)
  - [ ] Histórico de ahorro vs competencia
  - [ ] Reportes específicos para CFO/Finance
  - [ ] Integración con herramientas de productividad

- [ ] **Privacy y sensibilidad de datos**
  - [ ] Sistema de bandas salariales (Junior/Mid/Senior)
  - [ ] Configuración granular de privacy
  - [ ] Opción de anonimizar datos
  - [ ] Compliance GDPR completo

- [ ] **Engagement y cambio de comportamiento**
  - [ ] Gamificación de ahorro
  - [ ] Leaderboards de eficiencia
  - [ ] Challenges de equipo
  - [ ] Feedback loop con resultados
