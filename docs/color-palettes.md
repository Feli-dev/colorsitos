# 🎨 Sistema de Paletas de Colores

## Descripción

Este sistema permite comparar y explorar paletas de colores completas con tonos del 50 al 900, basadas en el sistema de colores de Tailwind CSS.

## Características

- ✅ Selección de paletas mediante selectores desplegables
- ✅ Comparación lado a lado de dos paletas
- ✅ Visualización de todos los tonos (50-900)
- ✅ Copiado de códigos hexadecimales con un clic
- ✅ Indicadores visuales de tonos en hover
- ✅ Interfaz responsive para móviles y escritorio

## Estructura de Archivos

```
src/
├── types/colors.ts           # Tipos TypeScript para paletas
├── data/palettes.ts          # Paletas predefinidas
├── utils/color-utils.ts      # Utilidades para manejo de colores
├── components/
│   ├── color-palette.tsx     # Componente para paleta individual
│   └── palette-comparator.tsx # Componente principal del comparador
└── app/page.tsx             # Página principal
```

## Agregar Nuevas Paletas

Para agregar una nueva paleta de colores, edita el archivo `src/data/palettes.ts`:

```typescript
export const colorPalettes: ColorPalette[] = [
  // ... paletas existentes
  {
    id: "nueva-paleta",
    name: "Nueva Paleta",
    shades: [
      { value: 50, hex: "#ffffff", name: "nueva-paleta-50" },
      { value: 100, hex: "#f5f5f5", name: "nueva-paleta-100" },
      // ... resto de tonos hasta 900
    ],
  },
];
```

## Utilidades Disponibles

### `hexToRgb(hex: string)`

Convierte un color hexadecimal a RGB.

### `getContrastRatio(color1: string, color2: string)`

Calcula la relación de contraste entre dos colores.

### `isLightColor(hex: string)`

Determina si un color es claro u oscuro.

### `createColorPalette(id, name, shades)`

Crea una nueva paleta de colores con formato estándar.

### `isValidHex(hex: string)`

Valida si un código hexadecimal es válido.

## Paletas Incluidas

- **Slate**: Grises neutrales
- **Blue**: Azules clásicos
- **Emerald**: Verdes modernos
- **Red**: Rojos vibrantes
- **Amber**: Naranjas cálidos
- **Purple**: Morados elegantes

## Funcionalidades Interactivas

1. **Selección de Paletas**: Usa los selectores para elegir paletas principal y secundaria
2. **Copiado de Colores**: Haz clic en el ícono de copiar para copiar el código hex
3. **Vista de Tonos**: Hover sobre las muestras de color para ver el número del tono

## Responsive Design

- **Móvil**: Layout vertical con paletas apiladas
- **Tablet**: Layout de dos columnas
- **Escritorio**: Layout optimizado con comparación lado a lado

## Tecnologías Utilizadas

- Next.js 15 con App Router
- TypeScript para tipado seguro
- Tailwind CSS para estilos
- ShadCN UI para componentes
- Lucide React para iconos
