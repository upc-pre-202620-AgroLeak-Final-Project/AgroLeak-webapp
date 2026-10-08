# Backend API Map

Este frontend fue construido contra `AgroLeak-Backend-v0.2-final`.

## IAM

```http
POST /api/v1/iam/auth/register
POST /api/v1/iam/auth/login
GET  /api/v1/iam/users/me
```

## Farm

```http
POST   /api/v1/farms
GET    /api/v1/farms
GET    /api/v1/farms/{id}
PUT    /api/v1/farms/{id}
DELETE /api/v1/farms/{id}

POST   /api/v1/farms/{farmId}/fields
GET    /api/v1/farms/{farmId}/fields
GET    /api/v1/fields/{id}
PUT    /api/v1/fields/{id}
DELETE /api/v1/fields/{id}

POST   /api/v1/fields/{fieldId}/sectors
GET    /api/v1/fields/{fieldId}/sectors
GET    /api/v1/sectors/{id}
PUT    /api/v1/sectors/{id}
DELETE /api/v1/sectors/{id}

POST   /api/v1/sectors/{sectorId}/crops
GET    /api/v1/sectors/{sectorId}/crops
GET    /api/v1/crops/{id}
PUT    /api/v1/crops/{id}
DELETE /api/v1/crops/{id}
```

## Devices

```http
POST  /api/v1/devices
GET   /api/v1/devices
GET   /api/v1/devices/{id}
PATCH /api/v1/devices/{id}/sector
```

## Monitoring

```http
POST /api/v1/monitoring/readings
GET  /api/v1/monitoring/readings
GET  /api/v1/monitoring/devices/{deviceId}/latest
GET  /api/v1/monitoring/devices/{deviceId}/latest-by-type
GET  /api/v1/monitoring/devices/{deviceId}/summary
```

El backend conserva también `/api/v1/readings` por compatibilidad; Angular utiliza la API DDD nueva `/monitoring`.

## Alerts

```http
GET   /api/v1/alerts
PATCH /api/v1/alerts/{id}/acknowledge
PATCH /api/v1/alerts/{id}/resolve
```

## Irrigation

```http
POST /api/v1/valves/{deviceId}/commands
PATCH /api/v1/valves/commands/{commandId}/confirm
GET /api/v1/valves/{deviceId}/mode
PUT /api/v1/valves/{deviceId}/mode
GET /api/v1/valves/{deviceId}/latest
```

## Pests

```http
POST /api/v1/pests/observations
GET  /api/v1/pests/observations
```

El alias `/api/v1/pest-observations` permanece en backend.

## Analytics

```http
GET /api/v1/analytics/dashboard
GET /api/v1/analytics/charts?deviceId=...
```

## Demo

```http
GET  /api/v1/demo
POST /api/v1/demo/scenarios/normal/{deviceId}
POST /api/v1/demo/scenarios/leak/{deviceId}
POST /api/v1/demo/scenarios/obstruction/{deviceId}
```

Todos los endpoints salvo register/login, Swagger y health requieren `Authorization: Bearer <JWT>`.
