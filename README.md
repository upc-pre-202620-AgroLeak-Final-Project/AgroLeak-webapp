# AgroLeak Frontend v0.1

Web Application académica del MVP **AgroLeak**, preparada para integrarse con `AgroLeak-Backend-v0.1`.

## Objetivo de la versión

Esta interfaz demuestra el flujo funcional de la entrega parcial:

`telemetría → backend → reglas → alertas → dashboard → acción manual de válvula → confirmación`

No intenta ser todavía la plataforma comercial completa.

## Stack

- React
- Vite
- JavaScript ES Modules
- CSS responsive propio
- REST API AgroLeak v0.1

## Funcionalidades incluidas

- Selección de dispositivo/gateway.
- Dashboard consolidado.
- Caudal de entrada y salida.
- Presión y humedad del suelo.
- Pérdida estimada.
- Estado del gateway.
- Historial de telemetría.
- Alertas activas e historial.
- Resolución manual de alertas.
- Envío de comandos OPEN/CLOSE a válvula.
- Simulación de confirmación del actuador.
- Registro visual de observaciones de plagas.
- Escenarios de exposición: NORMAL, LEAK y OBSTRUCTION.
- Diseño responsive.
- Estado visible de conexión con backend.

## Fuera de alcance de v0.1

- login/JWT;
- múltiples usuarios o empresas;
- WebSockets;
- MQTT desde el navegador;
- mapas/GIS;
- Computer Vision real;
- configuración avanzada de reglas;
- reportes PDF;
- notificaciones push/WhatsApp.

## Requisitos

- Node.js 20+
- npm
- AgroLeak Backend ejecutándose en `http://localhost:8080`

## Ejecutar

```bash
npm install
npm run dev
```

Por defecto la aplicación queda disponible en:

```text
http://localhost:5173
```

## Configurar API

Copia `.env.example` como `.env` si deseas cambiar la URL:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Flujo recomendado para exposición

1. Levantar PostgreSQL y backend.
2. Ejecutar el frontend.
3. Seleccionar el gateway demo.
4. Ejecutar **Normal**.
5. Ejecutar **Simular fuga**.
6. Mostrar la alerta generada y la diferencia de caudal.
7. Ir a **Válvula** y enviar `CLOSE`.
8. Mostrar estado `PENDING`.
9. Pulsar **Simular confirmación**.
10. Mostrar estado `CONFIRMED`.

## Estructura

```text
src/
├── assets/
├── components/
├── services/
│   └── api.js
├── utils/
│   └── format.js
├── App.jsx
├── main.jsx
└── styles.css
```

## Próximas versiones

### v0.2
- pantalla de dispositivos/sectores;
- formularios de configuración;
- mejores gráficas históricas;
- integración con ESP32/Wokwi.

### v0.3
- actualización en tiempo real con SSE/WebSockets;
- MQTT en backend;
- notificaciones.

### v0.4+
- autenticación;
- múltiples fundos;
- mapas;
- reglas configurables;
- Computer Vision real;
- analítica e IA.
