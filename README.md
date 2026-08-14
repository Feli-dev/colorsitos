# 🎨 Colorsitos

Un proyecto moderno desarrollado con las mejores tecnologías para desarrollo web.

## 🚀 Stack de Tecnologías

- **[Next.js 15](https://nextjs.org/)** - Framework de React para aplicaciones de producción
- **[TypeScript](https://www.typescriptlang.org/)** - Superset de JavaScript con tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de CSS utility-first
- **[ShadCN UI](https://ui.shadcn.com/)** - Biblioteca de componentes accesibles y reutilizables

## 🛠️ Instalación y Uso

### Requisitos previos

- Node.js (versión 18 o superior)
- npm, yarn, pnpm o bun

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd colorsitos

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install
```

### Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev
# o
yarn dev
# o
pnpm dev

# Abrir http://localhost:3000 en tu navegador
```

### Construcción para producción

```bash
# Generar build de producción
npm run build
npm run start

# o
yarn build
yarn start

# o
pnpm build
pnpm start
```

## 📦 Componentes Incluidos

El proyecto incluye los siguientes componentes de ShadCN UI:

- **Button** - Botones con diferentes variantes (default, secondary, destructive, outline, ghost, link)
- **Card** - Contenedores de contenido con header, content y description
- **Input** - Campos de entrada de texto
- **Badge** - Etiquetas para mostrar información adicional

## 🎯 Características

- ✅ **TypeScript** - Tipado estático para mejor desarrollo
- ✅ **Responsive Design** - Diseño adaptable a diferentes pantallas
- ✅ **Dark Mode Ready** - Soporte para modo oscuro
- ✅ **Component System** - Sistema de componentes reutilizables
- ✅ **Modern CSS** - Utility-first con Tailwind CSS
- ✅ **ESLint** - Linting de código configurado

## 📁 Estructura del Proyecto

```
colorsitos/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── input.tsx
│   └── lib/
│       └── utils.ts
├── components.json
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔧 Configuración

### ShadCN UI

El proyecto está configurado con ShadCN UI usando:

- **Color scheme**: Neutral
- **CSS variables**: Configuradas en `src/app/globals.css`
- **Import alias**: `@/*` para imports absolutos

### Tailwind CSS

Configuración personalizada en `tailwind.config.ts` con:

- Soporte para modo oscuro
- Variables CSS integradas con ShadCN UI
- Responsive breakpoints optimizados

## 🎨 Personalización

### Agregar nuevos componentes de ShadCN UI

```bash
npx shadcn@latest add [component-name]
```

Componentes disponibles: button, input, card, badge, dialog, dropdown-menu, etc.

### Personalizar colores

Edita las variables CSS en `src/app/globals.css` para cambiar la paleta de colores.

## 📚 Recursos Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de ShadCN UI](https://ui.shadcn.com/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🙏 Créditos

Este proyecto incluye componentes de terceros, adaptados y redistribuidos bajo licencia MIT:

| Componente | Proyecto | Licencia |
| ---------- | -------- | -------- |
| `src/components/magicui/cool-mode.tsx` | [Magic UI](https://magicui.design/docs/components/cool-mode) · [repo](https://github.com/magicuidesign/magicui) | MIT |
| `src/components/ui/shadcn-io/color-picker/` | [Kibo UI](https://www.shadcn.io/components/color-picker) · [repo](https://github.com/haydenbleasel/kibo) | MIT |

Los componentes en `src/components/ui/` que no figuran arriba provienen de
[shadcn/ui](https://ui.shadcn.com/), también bajo licencia MIT.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [`LICENSE`](./LICENSE) para más detalles.
