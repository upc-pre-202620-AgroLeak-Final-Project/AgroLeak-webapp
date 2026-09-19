# AgroLeak Frontend

Aplicación web responsive para monitorear riego, anomalías de caudal, alertas,
electroválvulas y dispositivos IoT de AgroLeak. Incluye una vista de prototipo
para el futuro módulo de cámara e inteligencia artificial orientado a plagas.

## Funcionalidades

- inicio de sesión con el JWT del backend;
- navegación diferente para `PRODUCER` y `ADMIN`;
- resumen operativo con indicadores y alertas recientes;
- comparación visual de caudal de entrada y salida;
- cierre preventivo y reapertura documentada de válvulas;
- atención, reconocimiento y resolución de alertas;
- gestión visual de fincas y parcelas;
- inventario y registro de dispositivos IoT;
- administración de usuarios para el rol administrador;
- prototipo visual de detección de plagas con cámara;
- modo demostración independiente del backend;
- diseño adaptable a computadora, tablet y teléfono.

## Tecnologías

- React 19
- TypeScript
- Vite
- React Router
- Lucide Icons
- CSS responsive sin framework visual externo

## Requisito previo

Para trabajar con datos reales, el backend debe continuar ejecutándose en:

```text
http://localhost:8080
```

Puedes comprobarlo abriendo:

```text
http://localhost:8080/actuator/health
```

## Iniciar en macOS con Node.js

Abre una nueva Terminal; no cierres la Terminal donde se ejecuta el backend.

Si descomprimiste este proyecto en Descargas:

```bash
cd /Users/kalidpalacios/Downloads/AgroLeak-Frontend
cp .env.example .env
npm install
npm run dev
```

Abre:

```text
http://localhost:5173
```

## Iniciar con Docker

Con Docker Desktop encendido:

```bash
cd /Users/kalidpalacios/Downloads/AgroLeak-Frontend
cp .env.example .env
docker compose up --build
```

Luego abre `http://localhost:5173`.

Para detener únicamente el frontend:

```bash
docker compose down
```

## Usuarios del backend

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@agroleak.local` | `ChangeMe123!` |
| Productor | `producer@agroleak.local` | `ChangeMe123!` |

Las credenciales son exclusivamente para desarrollo.

## Modo demostración

En el login puedes usar **Demo productor** o **Demo administrador**. Este modo:

- no necesita que el backend esté encendido;
- usa datos simulados dentro del navegador;
- permite recorrer y probar las acciones visuales;
- no modifica PostgreSQL ni envía órdenes a dispositivos físicos.

Para volver a utilizar el backend real, cierra sesión e ingresa con una de las
cuentas de desarrollo.

## Configuración de la API

El archivo `.env` contiene:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Si despliegas el backend en otro servidor, cambia esa dirección y vuelve a
compilar el frontend.

También debes actualizar en el backend:

```env
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Para producción, reemplaza `http://localhost:5173` por la URL pública exacta del
frontend.

## Compilar para producción

```bash
npm run build
```

El resultado se crea dentro de `dist/`.

Para comprobar localmente la compilación:

```bash
npm run preview
```

## Estructura principal

```text
AgroLeak-Frontend/
├── src/
│   ├── components/       Componentes reutilizables y layout
│   ├── contexts/         Sesión y notificaciones
│   ├── data/             Información del modo demostración
│   ├── lib/              Cliente API y formatos
│   ├── pages/            Pantallas de la plataforma
│   ├── types/            Contratos TypeScript del backend
│   ├── App.tsx           Rutas y protección por rol
│   ├── main.tsx          Entrada de React
│   └── styles.css        Sistema visual responsive
├── Dockerfile
├── compose.yaml
├── nginx.conf
├── package.json
└── vite.config.ts
```

## Integración con cámara e IA

El backend actual registra cámaras y actuadores localizados como dispositivos,
pero todavía no expone endpoints de observaciones de plagas. Por eso la página
**Visión IA** identifica claramente sus observaciones como datos simulados.

La siguiente iteración deberá conectar:

```text
POST  /api/v1/edge/telemetry/pest
GET   /api/v1/pest-observations
PATCH /api/v1/pest-observations/{id}/validate
POST  /api/v1/pest-observations/{id}/authorize-control
```

La respuesta física debe mantenerse localizada, trazable y con validación
humana durante el prototipo académico.

## Solución rápida de problemas

### La pantalla indica que no puede conectar con el backend

Comprueba que los contenedores del backend estén activos:

```bash
cd /Users/kalidpalacios/Downloads/AgroLeak-Backend
docker compose ps
```

### El puerto 5173 ya está ocupado

Detén otro frontend que lo esté utilizando o ejecuta:

```bash
npm run dev -- --port 5174
```

Si usas el puerto 5174, agrega `http://localhost:5174` a los orígenes permitidos
del backend.

### Quiero borrar la sesión guardada

Pulsa tu nombre en la esquina superior derecha y selecciona **Cerrar sesión**.
También puedes borrar los datos del sitio desde las herramientas del navegador.
