# AgroLeak Web Architecture

## Objetivo

El frontend replica los límites de negocio definidos por el backend para evitar una UI organizada únicamente por componentes técnicos.

```text
Angular Web
   ↓ HTTP + JWT
AgroLeak REST API
   ↓
Spring Boot modular monolith
   ↓
PostgreSQL
```

## Bounded Contexts

### IAM

- `domain/model`: User, Role, auth DTO contracts.
- `application`: AuthFacade.
- `infrastructure`: AuthApi, TokenStorage.
- `presentation`: Login, Register, Profile.

### Farm

- Farm, Field, Sector, Crop.
- Los IDs entre contextos se mantienen como UUID/string; el frontend no crea acoplamientos de objetos gigantes.

### Devices

- Gateway, sensores, camera y valve.
- Estado operacional y vínculo con `sectorId`.

### Monitoring

- SensorReading, SensorType, ReadingStatistics.
- El historial y summary provienen de `/api/v1/monitoring`.

### Alerts

- AlertType, AlertSeverity y AlertStatus.
- Acciones de acknowledge / resolve.

### Irrigation

- ValveAction, ValveCommandStatus y OperationMode.

### Pests

- PestObservation.
- No asume que CV sea real todavía: consume el resultado que expone la API.

### Analytics

- Read model para dashboard y gráficos.
- No reproduce reglas del backend; solo agrega y presenta respuestas.

## Cross-cutting

`core/` contiene únicamente preocupaciones transversales:

- auth guard;
- HTTP interceptors;
- backend health;
- i18n;
- application shell.

`shared/` contiene UI reutilizable sin lógica de negocio.

## Seguridad

El token JWT se almacena en `localStorage` para el alcance académico actual y se adjunta solamente a requests dirigidos a `environment.apiUrl`.

Para una evolución productiva se puede migrar a un esquema de cookies HttpOnly o rotación de refresh tokens cuando el backend lo soporte.

## Entornos

```text
DEV  → localhost:4200 → localhost:8081
PROD → frontend cloud  → backend cloud → PostgreSQL cloud
```

`environment.production.ts` no contiene secretos; únicamente URLs públicas.
