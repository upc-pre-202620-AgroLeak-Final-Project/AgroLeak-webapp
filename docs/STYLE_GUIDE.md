# AgroLeak Style Guidelines

## Principios

1. **Agrícola, no rústico:** verde profundo y superficies claras, evitando clichés visuales excesivos.
2. **Operacional:** estados y anomalías deben distinguirse en menos de un segundo.
3. **Densidad controlada:** dashboards con datos suficientes, pero tarjetas con jerarquía clara.
4. **Material como base:** Angular Material resuelve controles, tablas, inputs y accesibilidad; AgroLeak añade identidad mediante tokens.

## Tokens

Definidos en:

```text
src/styles/_tokens.scss
```

Principales:

```text
Primary       #0F4C3A
Primary 2     #176B52
Accent        #78B159
Highlight     #D7F1BF
Background    #F5F7F3
Surface       #FFFFFF
Text          #1C2A24
Muted         #6D7C74
Danger        #C33E3E
Warning       #B57418
Success       #1F7A4C
```

## Tipografía

- Inter para interfaz y datos.
- Peso 700+ solo para encabezados, KPIs y acciones prioritarias.
- IDs técnicos utilizan `ui-monospace`.

## Espaciado

Escala recomendada:

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40
```

## Radios

```text
Small   10px
Medium  14px
Large   20px
```

## Estados

```text
ONLINE / RESOLVED / CONFIRMED → success
MAINTENANCE / ACTIVE / PENDING → warning
OFFLINE / FAILED / CRITICAL   → danger
ACKNOWLEDGED                   → info
```

No usar únicamente color: `StatusChip` siempre conserva texto.

## Responsive

- Desktop: sidebar fijo.
- Mobile: navegación inferior compacta.
- Grids de 4 → 2 → 1 columnas.
- Tablas admiten scroll horizontal.
