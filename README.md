# AgroLeak Web — Angular DDD

Frontend Angular para **AgroLeak**, alineado con `AgroLeak-Backend-v0.2-final`.

## Stack

- Angular 20 (standalone components)
- TypeScript
- Angular Material + CDK
- RxJS + Signals
- Chart.js
- SCSS
- JWT interceptor + route guard
- i18n runtime ES / EN
- Arquitectura DDD por bounded contexts

## Backend esperado

Por defecto:

```text
Backend:    http://localhost:8081
API:        http://localhost:8081/api/v1
PostgreSQL: localhost:5433
Frontend:   http://localhost:4200
```

El frontend consume directamente los bounded contexts reales del backend:

- IAM
- Farm
- Devices
- Monitoring
- Alerts
- Irrigation
- Pests
- Analytics
- Demo (apoyo académico)

## Ejecutar

Requisitos:

- Node.js 20.19+ o 22.12+
- npm
- AgroLeak Backend ejecutándose en `localhost:8081`

```bash
npm install
npm start
```

Abrir:

```text
http://localhost:4200
```

### Usuario demo del backend

```text
Email:    demo@agroleak.local
Password: AgroLeakDemo123!
```

El formulario de login viene precargado con estas credenciales para facilitar la exposición.

## Production environment

Editar antes del deploy:

```text
src/environments/environment.production.ts
```

Cambiar:

```ts
backendUrl: 'https://api.agroleak.example',
apiUrl: 'https://api.agroleak.example/api/v1'
```

Y asegurar que `CORS_ALLOWED_ORIGINS` del backend incluya el dominio real del frontend.

Build:

```bash
npm run build:prod
```

## DDD Frontend

Cada bounded context está organizado, cuando corresponde, como:

```text
bounded-context/
├── application/
├── domain/
│   └── model/
├── infrastructure/
└── presentation/
    └── pages/
```

Los controllers REST del backend se reflejan como `Api` adapters en `infrastructure`.
Las pages no construyen URLs directamente.

## Flujos implementados

### IAM

- registro;
- login;
- JWT;
- interceptor Bearer;
- guard de rutas;
- `/users/me`;
- logout.

### Farm Management

- listar y crear fundos;
- estructura Farm → Field → Sector → Crop;
- formularios de creación;
- navegación por fundo.

### Devices

- listado de dispositivos;
- alta de dispositivo;
- estado, batería, firmware, sector y lastSeen.

### Monitoring

- selección de dispositivo;
- histórico por rango;
- estadísticas AVG / MIN / MAX;
- gráfico Chart.js;
- tabla de lecturas.

### Alerts

- filtros;
- severidad / status;
- acknowledge;
- resolve.

### Irrigation

- selección de válvula;
- OPEN / CLOSE;
- MONITOR_ONLY / MANUAL / AUTO_SAFE;
- confirmación simulada de actuador.

### Pest Monitoring

- galería de observaciones;
- registro manual/simulado;
- confidence, count, camera/device y sector.

### Analytics

- consumo de agua;
- pérdida estimada;
- alertas;
- dispositivos online/offline/maintenance;
- plagas del día;
- telemetría de 24 horas;
- escenarios demo NORMAL / LEAK / OBSTRUCTION.

## i18n

Archivos:

```text
src/assets/i18n/es.json
src/assets/i18n/en.json
```

El idioma se cambia desde la barra lateral.

## Style Guidelines

Ver [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md).

## Arquitectura

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Roadmap restante (~20%)

- MQTT real;
- WebSockets / SSE;
- Computer Vision real;
- ML de anomalías;
- AUTO_SAFE autónomo;
- push / WhatsApp;
- GIS avanzado;
- password recovery / refresh tokens avanzados.
