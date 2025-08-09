## Roadmap — Generador de Paletas (Colorsitos)

Objetivo: transformar la app en un generador de paletas a partir de un color base (hex) en la posición 500, manteniendo la lógica de generación existente, incorporando validación, guardado en localStorage, soporte multi-idioma (ES/EN), generación en tiempo real con debounce y exportadores para Chakra UI v2/v3 y Tailwind v3/v4, incluyendo el tono 950.

---

### Progreso (resumen)

- [x] 1. Limpieza y preparación (eliminado comparador y datasets; nueva UI generador)
- [x] 2. Generador (refactor sin Chakra, helpers, shade 950)
- [x] 3. Validación + debounce + errores accesibles
- [x] 4. Vista previa con 50→950 y copiado por tono
- [x] 5. Guardado, listado, carga y eliminación en localStorage (hook)
- [x] 6. Exportadores Chakra v2/v3 y Tailwind v3/v4 + UI en modal (Shadcn Dialog) con formatos Hex/RGB/HSL/OKLCH y "Just the codes"
- [x] 7. i18n ES/EN con auto-detección y textos externalizados
- [~] 8) Accesibilidad y dark mode (básico completado; seguir puliendo si hace falta)
- [ ] 9. Pruebas de regresión y snapshots
- [~] 10) Performance y DX (debounce/memo listo; opcional persistir preferencias de exportación)

### 0) Restricciones y lineamientos

- Mantener la lógica actual del generador (`src/utils/palette-generator.ts`) para que la salida no cambie vs. la implementación existente; solo refactorizar dependencias para que compile en este proyecto.
- Eliminar comparador y paletas predefinidas: UI con un único input de hex + vista previa de la paleta generada.
- Incluir tonos: 50, 100, 200, 300, 400, 500 (base), 600, 700, 800, 900 y 950.
- Validación estricta de hex (3 o 6 dígitos, con/sin `#`). Si es inválido: no generar y mostrar error accesible.
- Guardado opcional de paletas en `localStorage` con nombre configurable; si no hay nombre, usar el hex como nombre.
- Generación en tiempo real con debounce.
- Multi-idioma ES/EN, auto-detección (navegador/headers) con fallback consistente.

Patrones/tecnologías a usar:

- React 19 + Next.js 15 (App Router). Componentes cliente para la UI del generador.
- Utilidades de colores centralizadas en `src/utils/color-utils.ts`. Añadir helpers faltantes: `rgbToHex`, `rgbToHsl`, `hslToRgb`, `validateHex`.
- Persistencia local: wrapper sobre `localStorage` con hidratación segura (solo cliente) y esquema de datos tipado.
- Debounce: `useCallback` + `setTimeout`/`clearTimeout` (sin dependencia externa).
- i18n: `next-intl` (App Router) o solución minimalista client-side. Propuesta: `next-intl` para SSR/RSC y mensajes por locale.
- Tipos propios para la paleta generada (`Record<50|100|...|950, string>`) y adaptación a `ColorPalette` para UI.
- Exportadores modulares: `src/utils/exporters/` con funciones puras que devuelvan strings (código/copiar/descargar).
- Testing: pruebas unitarias del generador y snapshots de exportadores.

---

### 1) Limpieza y preparación

Estado: Completado

Acciones:

- Eliminar el comparador y referencias:
  - Remover `src/components/palette-comparator.tsx` y su uso en `src/app/page.tsx`.
  - Remover `src/data/palettes.ts` y cualquier import.
- Crear nueva vista principal `PaletteGenerator` y montar en `src/app/page.tsx`.

Criterios de aceptación:

- La app renderiza una pantalla con un input de hex, nombre opcional, vista previa vacía al inicio.

---

### 2) Generador de paletas (refactor sin cambiar lógica)

Estado: Completado

Acciones:

- Adaptar `src/utils/palette-generator.ts` para:
  - Quitar dependencia de Chakra (`ColorHues`).
  - Exportar `generateColorPalette(baseHex)` con salida tipada: `Record<50|100|200|300|400|500|600|700|800|900|950, string>`.
  - Usar helpers centralizados de `color-utils` (añadir: `rgbToHex`, `rgbToHsl`, `hslToRgb`, `validateHex`).
  - Añadir generación del tono 950 preservando la misma configuración de la implementación actual.
- No alterar fórmulas/constantes (respetar resultado actual para cada shade).

Criterios de aceptación:

- Dado un hex de ejemplo, la paleta resultante coincide con la lógica previa (se agregará test de regresión).

---

### 3) Validación y UX del input (debounce)

Estado: Completado

Acciones:

- Validar hex (3 o 6 dígitos, con/sin `#`, case-insensitive) con `validateHex` (+ `isValidHex`).
- Bloquear generación si es inválido, mostrar mensaje de error accesible (`aria-invalid`, `role="alert"`).
- Generación en tiempo real al tipear con debounce de ~250–400 ms.
- Mantener UI reactiva: placeholder/skeleton mientras se genera (si aplica) y estados claros.

Criterios de aceptación:

- Ingresar `#3182ce` genera automáticamente la paleta tras el debounce. Ingresar `#xyz` muestra error y no genera.

---

### 4) Componente de vista previa y acciones

Estado: Completado (acciones globales de copiado cubiertas vía exportadores)

Acciones:

- Reutilizar `ColorPaletteComponent` adaptándolo para recibir una paleta generada (con 950) y mostrar los 11 tonos.
- Acciones por tono: copiar hex (funcionalidad ya existente).
- Acciones globales: copiar JSON de la paleta, copiar como variables CSS, copiar como objeto TS.

Criterios de aceptación:

- La paleta generada se muestra con 50→950; copiar por tono y acciones globales funcionan.

---

### 5) Guardado en localStorage

Estado: Completado

Acciones:

- Crear `src/utils/storage.ts` con API segura para cliente:
  - `loadSavedPalettes(): SavedPalette[]`
  - `savePalette(palette: SavedPalette): void`
  - `deletePalette(id: string): void`
- Modelo `SavedPalette`:
  - `{ id: string; name: string; baseHex: string; shades: Record<...>; createdAt: string }`
  - `id` derivado (por ejemplo, slug de `name` + hash corto del hex) para evitar colisiones simples.
- UI: botón “Guardar” habilitado solo con paleta válida; input de nombre opcional (fallback: hex normalizado).
- Listado (sección lateral/simple): paletas guardadas, con opción de volver a cargarlas y eliminarlas.

Criterios de aceptación:

- Guardar, listar, recargar y eliminar funcionan y persisten entre reloads.

---

### 6) Exportadores: Chakra UI v2/v3 y Tailwind v3/v4

Estado: Completado

Estructura propuesta: `src/utils/exporters/`

Acciones:

- Chakra UI v2 (tema antiguo):
  - Exportar objeto `const colors = { brand: { 50: '#...', ..., 900: '#...' } }` o snippet para `extendTheme` v2. (Se omite 950 por compatibilidad)
- Chakra UI v3 (tema moderno):
  - Exportar snippet compatible con `defineStyleConfig`/`extendTheme` v3 y el shape de `colors` actual.
- Tailwind v3 (tailwind.config.js/ts):
  - `theme.extend.colors = { brand: { 50: '#...', ..., 950: '#...' } }`.
- Tailwind v4 (CSS-first):
  - Exportar bloque CSS con variables:
    - `:root { --brand-50: #...; ... --brand-950: #... }`
  - Incluir snippet complementario de uso `@theme` si aplica al setup actual de Tailwind v4.
- Cada exportador devuelve string listo para copiar/descargar.

Notas de implementación:

- UI de exportación integrada en un modal (Shadcn Dialog) con tabs: Tailwind v4, Tailwind v3, Chakra v3, Chakra v2 y "Just the codes".
- Conversión de formatos: Hex, RGB, HSL, OKLCH. Prefijo e índices opcionales en Tailwind v4.

Criterios de aceptación:

- Para un input dado, los cuatro exportadores generan snippets válidos y bien formateados.

---

### 7) Multi-idioma (ES/EN) con auto-detección

Estado: Completado

Acciones:

- Integrar `next-intl` para App Router:
  - Cargar mensajes `es` y `en` desde `src/i18n/messages/{es,en}.json`.
  - Provider en `src/app/layout.tsx`.
  - Auto-detección por `headers()` (SSR) o `navigator.language` (cliente), con fallback a `es`.
- Externalizar todas las cadenas visibles (labels, placeholders, errores, CTA de exportación/guardado).

Criterios de aceptación:

- Cambiando el idioma del navegador, la UI aparece en ES o EN automáticamente (con fallback predecible).

---

### 8) Accesibilidad y dark mode

Estado: Completado (básico)

Acciones:

- Inputs con `aria-invalid`, `aria-describedby` para mensajes de error.
- Contraste suficiente en chips/tiles de color (usar `isLightColor` para texto). Mantener consistencia con tema actual.
- Respetar dark mode actual (variables CSS en `globals.css`).

Criterios de aceptación:

- Navegación por teclado, anuncios de error por lectores de pantalla y contraste adecuados.

---

### 9) Pruebas y aseguramiento de regresión

Estado: Pendiente

Acciones:

- Tests unitarios para el generador:
  - Vectores fijos (ej. `#3182CE`, `#F40009`, `#0DD6A8`) comparando salida anterior vs. nueva.
  - Casos borde (grises, saturación baja, 3 dígitos, minúsculas/mayúsculas, sin `#`).
- Tests de exportadores (snapshots de strings generados).

Criterios de aceptación:

- Suite de pruebas en verde y protege la lógica de generación.

---

### 10) Performance y DX

Estado: Completado (parcial)

Acciones:

- Debounce ligero, evitar renders innecesarios (memoizar paleta generada por `baseHex` normalizado).
- No introducir dependencias innecesarias; mantener bundle pequeño.

Criterios de aceptación:

- Interacción fluida, sin jank, en dispositivos modestos.

---

### 11) Entregables y plan de commits (Conventional Commits)

Sugerencia de commits atómicos:

- `refactor: remove comparator and predefined palettes`
- `feat(utils): add color helpers (rgb↔hsl, hex validate) and storage api`
- `feat(generator): adapt palette-generator to project and add 950 tone`
- `feat(ui): add generator page with debounced hex input and preview`
- `feat(persistence): enable save/load/delete palettes from localStorage`
- `feat(exporters): add chakra v2/v3 and tailwind v3/v4 exporters`
- `feat(i18n): integrate next-intl and translate ui (es/en) with auto-detect`
- `test: add regression tests for generator and snapshots for exporters`
- `docs: update readme with usage and exporters`

---

### 12) Plan de implementación paso a paso (orden propuesto)

1. Limpieza y nueva página del generador (Sección 1).
2. Refactor del generador + helpers de color (Sección 2).
3. Validación + debounce + vista previa (Secciones 3–4).
4. Persistencia en localStorage (Sección 5).
5. Exportadores (Sección 6).
6. i18n (Sección 7).
7. Accesibilidad y dark mode checks (Sección 8).
8. Pruebas (Sección 9).
9. Documentación final y DX (Secciones 10–11).

---

### Notas técnicas específicas

- `validateHex` debe normalizar a formato `#RRGGBB` y lanzar error para valores inválidos.
- El generador debe incluir el shade 950 con el mismo esquema de configuración presente en `SHADE_CONFIGS`.
- Al guardar, si no hay nombre, usar el hex normalizado como `name` y `id` derivado de `name`+`hex` (slug + hash corto).
- Para Tailwind v4, proveer bloque de variables CSS (`:root`) y, opcionalmente, ejemplo de uso con `@theme inline` para tokens.
