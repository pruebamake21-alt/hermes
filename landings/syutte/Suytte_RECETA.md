# Suytte — SaaS de agentes IA telefónicos para inmobiliarias

## Qué hace
- Agente IA (Vapi) atiende llamadas automáticamente, consulta inmuebles disponibles y captura leads
- Dashboard para que cada inmobiliaria gestione sus inmuebles, leads y conversaciones
- Registro self-service con cuenta lista en minutos

## Características
- Agente vocal IA con voz compartida (todas las inmobiliarias comparten una misma voz)
- Atención multicanal: llamadas + WhatsApp
- CRUD de inmuebles + importación CSV por lote
- Captura de leads con teléfono, nombre, presupuesto, notas de la conversación
- Grabación y transcripción de llamadas
- Dashboard con métricas: llamadas hoy, leads nuevos, inmuebles activos
- **Smart Match**: cruce automático entre necesidades del lead e inmuebles disponibles
- Multi-tenant: cada inmobiliaria ve solo sus datos
- **Onboarding** guiado para nuevos usuarios (configuración inicial)
- **Twilio**: compra/asignación de número telefónico (preparado sin configurar)
- Auth email + password (Google diferido)
- Pricing en 3 tiers: €100, €300, €500/mes
- Paddle para pagos recurrentes (pendiente de cuenta)

## Administración (panel completo)
- System prompt del asistente Vapi (editable desde la UI)
- Variables del asistente (crear, modificar, eliminar)
- Usuarios: CRUD completo, altas/bajas, resúmenes por agente
- Reportes: facturación total, tickets de soporte, datos históricos
- Incidencias / Tickets de soporte
- Dashboard con gráficos históricos (ingresos, leads, llamadas)

## Pila técnica
- Frontend: Next.js 14 (TypeScript, Tailwind, App Router)
- Agente vocal: Vapi (asistente + webhooks)
- Base de datos: Supabase (PostgreSQL) con Prisma ORM
- Auth: NextAuth v4 con Credentials
- Pagos: Paddle (preparado, cuenta pendiente)
- Despliegue: Apache en /var/www/html/suytte (servidor propio)

## Modelo de datos

### Inmueble (Property)
| Campo | Tipo | Descripción |
|---|---|---|
| **Información básica** | | |
| operationType | enum | VENTA, ALQUILER, ALQUILER_VACACIONAL |
| propertyType | enum | PISO, CASA, LOCAL, OFICINA, TERRENO |
| price | Decimal | Precio |
| currency | string | EUR, USD, etc |
| status | enum | DISPONIBLE, RESERVADO, VENDIDO, ALQUILADO |
| **Características físicas** | | |
| usableSurface | Decimal | Metros útiles |
| builtSurface | Decimal | Metros construidos |
| bedrooms | int | Dormitorios |
| bathrooms | int | Baños completos |
| toilets | int | Aseos |
| floor | string | Planta (si es piso) |
| hasElevator | boolean | ¿Ascensor? |
| terrace | boolean | Terraza |
| balcony | boolean | Balcón |
| garage | boolean | Garaje |
| storageRoom | boolean | Trastero |
| pool | boolean | Piscina |
| airConditioning | boolean | Aire acondicionado |
| heating | boolean | Calefacción |
| energyCert | enum | A, B, C, D, E, F, G |
| **Ubicación** | | |
| address | string | Dirección completa (uso interno) |
| latitude | float | Coordenada |
| longitude | float | Coordenada |
| zone | string | Barrio/zona |
| hideExactAddress | boolean | Mostrar solo zona aproximada |
| **Multimedia** | | |
| title | string | Título comercial |
| description | text | Descripción larga |
| photos | string[] | URLs de fotos (Supabase Storage) |

### Lead
- **nombre** — string
- **teléfono** — string
- **email** — string
- **presupuesto** — Decimal
- **canal** — enum: llamada_telefonica, web, manual, whatsapp
- **financiacion** — boolean (¿necesita financiación?)
- **urgencia** — enum: inmediata, primer_mes, sin_urgencia
- **idioma** — string (es, en, etc.)
- **propertyId** — string (ID de referencia del inmueble por el que pregunta)
- **tipoConsulta** — enum: comprar, alquilar, vender, tasar, otro
- **estado** — enum: Nuevo, Contactado, Visita_programada, Descartado, Ganado
- **notasAgente** — text (notas internas del agente)
- **notas** — text (notas de la conversación)
- **tenantId** — relación con la inmobiliaria
- **createdAt** — datetime
- **ultimoContacto** — datetime

### Llamada (Call)
| Campo | Tipo | Descripción |
|---|---|---|
| vapiCallId | string | ID de referencia en Vapi |
| leadId | relación | Lead asociado |
| tenantId | relación | Inmobiliaria |
| customerPhone | string | Número que llamó |
| duracion | int | Segundos |
| grabacionUrl | string? | URL del audio |
| transcripcion | text? | Transcripción completa |
| resumen | text? | Resumen generado por Vapi |
| satisfaccion | enum | bien, frustrado, rechazo_ia, indiferente |
| coste | Decimal? | Coste del cómputo en Vapi |
| estado | enum | completada, fallida, no_contesta, ocupado |
| startedAt | datetime | Inicio |
| endedAt | datetime | Fin |

## Deferido
- Google Auth
- Landing page pública

## Plan de fases

| # | Fase | Descripción | Hito |
|---|---|---|---|
| 1 | Schema + Supabase | Prisma, conexión, migración | ✅ |
| 2 | CRUD Inmuebles | Lista, crear, editar, detalle, sidebar | ✅ |
| 3 | Leads + Llamadas | Lista, detalle, cambio de estado | ✅ |
| 4 | **Importación CSV** | Subida masiva de inmuebles desde CSV | ⏳ |
| 5 | **Onboarding** | Wizard de bienvenida: datos del negocio → variables Vapi → activación | ⏳ |
| 6 | **Dashboard métricas** | Gráficos, KPIs, stats principales | ⏳ |
| 7 | **Integración Vapi** | Webhooks, auto-creación de leads y calls | ⏳ |
| 8 | **WhatsApp + Twilio** | Conectar WhatsApp, preparar compra de número | ⏳ |
| 9 | **Smart Match** | Cruce lead ↔ inmueble: presupuesto, tipo, zona, urgencia | ⏳ |
| 10 | **Panel Admin** | System prompt, variables, usuarios, reportes, tickets, gráficos históricos | ⏳ |
| 11 | **Template Aeline** | Estilos finales | ⏳ |
