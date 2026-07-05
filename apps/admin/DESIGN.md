---
name: OmStore
description: Sistema Administrativo POS para tienda de calzado
colors:
  primary-50: "#f7f7f7"
  primary-100: "#e3e3e3"
  primary-200: "#c8c8c8"
  primary-300: "#a4a4a4"
  primary-400: "#818181"
  primary-500: "#666666"
  primary-600: "#1a1a1a"
  primary-700: "#0d0d0d"
  primary-800: "#080808"
  primary-900: "#000000"
  neutral-bg: "#f9fafb"
  neutral-surface: "#ffffff"
  neutral-border: "#e5e7eb"
  neutral-text: "#111827"
  neutral-text-secondary: "#6b7280"
  dark-bg: "#030712"
  dark-surface: "#111827"
  dark-border: "#1f2937"
  dark-text: "#f9fafb"
  semantic-success: "#16a34a"
  semantic-warning: "#d97706"
  semantic-error: "#dc2626"
  semantic-info: "#2563eb"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 700
    lineHeight: 1.25
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-600}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-700}"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1rem"
    borderColor: "#d1d5db"
  badge:
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.5rem"
    typography: "{typography.label}"
    fontSize: "0.75rem"
---

# Design System: OmStore

## 1. Overview

**Creative North Star: "El Mostrador"**

Como el mostrador de una tienda de zapatos bien organizada: todo tiene su lugar, las herramientas están a la mano, la superficie de trabajo está limpia. OmStore es un sistema administrativo que prioriza claridad sobre densidad, donde los datos financieros y de inventario se presentan con precisión profesional pero sin frialdad corporativa.

Este sistema rechaza explícitamente la sobrecarga visual: sin dashboards ruidosos, sin gradientes decorativos, sin información apilada sin jerarquía. Cada elemento está al servicio de una tarea: vender, contar stock, generar reportes.

**Key Characteristics:**
- Paleta neutral monocromática con acentos semánticos precisos
- Cards con sombras suaves y bordes definidos
- Tipografía funcional sin adornos
- Estados interactivos sólidos y predecibles
- Modo oscuro completo basado en clase `.dark`

## 2. Colors

Paleta predominantemente neutral (escala de grises) donde el color se reserva para comunicación de estado y acción.

### Primary

- **Gris Carbón** (#1a1a1a / `primary-600`): Acciones primarias, botones principales, paginación activa, color de marca.
- **Gris Carbón Profundo** (#0d0d0d / `primary-700`): Hover de botones primarios.
- **Gris Hueso** (#f7f7f7 / `primary-50`): Fondo de navegación activa, fondos de tabla.

### Neutral

- **Fondo Claro** (#f9fafb / `bg-gray-50`): Fondo general de página en modo claro.
- **Superficie Blanca** (#ffffff): Cards, inputs, sidebar.
- **Borde Claro** (#e5e7eb / `border-gray-200`): Bordes de cards, tablas, sidebar.
- **Texto Primario** (#111827 / `gray-900`): Headings, contenido principal.
- **Texto Secundario** (#6b7280 / `gray-500`): Metadatos, subtítulos, placeholders.

### Dark Mode

- **Fondo Oscuro** (#030712 / `bg-gray-950`)
- **Superficie Oscura** (#111827 / `bg-gray-900`)
- **Borde Oscuro** (#1f2937 / `border-gray-800`)
- **Texto Claro** (#f9fafb / `gray-100`)

### Semántico

- **Verde Éxito** (#16a34a / `green-600`): Stock disponible, activo, positivo.
- **Ámbar Advertencia** (#d97706 / `amber-600`): Stock bajo, atención requerida.
- **Rojo Error** (#dc2626 / `red-600`): Sin stock, inactivo, error, cancelación.
- **Azul Información** (#2563eb / `blue-600`): Métricas informativas, enlaces.

### Named Rules

**La Regla del Silencio Visual.** El gris es el lienzo. Los acentos de color ocupan <10% de la pantalla y solo comunican estado o acción. Su rareza es el punto.

## 3. Typography

**Display/Body Font:** System UI Sans (ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Monospace Font:** ui-monospace, SFMono-Regular (para datos numéricos en tablas)

**Carácter:** Funcional, sin adornos. La tipografía no compite con los datos. Stack nativo del sistema para máxima compatibilidad y rendimiento.

### Hierarchy

- **Headline** (Bold 700, 1.5rem / 24px, 1.25): Títulos de página. Máximo 1 por vista.
- **Subheadline** (Semibold 600, 1.125rem / 18px, 1.3): Títulos de sección dentro de cards.
- **Body** (Regular 400, 0.875rem / 14px, 1.5): Contenido general, tablas, descripciones.
- **Label** (Medium 500, 0.875rem / 14px, 1.4): Botones, labels de formulario.
- **Caption** (Regular 400, 0.75rem / 12px, 1.4): Metadatos, badges, timestamps.
- **Display** (Bold 700, 1.875rem / 30px, 1.2): Grandes números en stat cards (solo valor numérico).

### Named Rules

**La Regla del Tamaño Único.** La interfaz usa 4 tamaños de fuente máximo (0.75rem, 0.875rem, 1.125rem, 1.5rem). No hay tamaños decorativos. La jerarquía la da el weight, no el size extremo.

## 4. Elevation

Sistema de elevación híbrido: superficies planas en reposo con sombras suaves en cards y contenedores para establecer jerarquía visual. Sin gradientes, sin glassmorphism, sin fondos texturizados.

Cards usan `shadow-sm` (0 1px 2px 0 rgba(0, 0, 0, 0.05)) con borde de 1px. No hay sombras múltiples ni profundidad dramática. En hover, los elementos interactivos (filas de tabla, items de lista) cambian de color de fondo, no de elevación.

### Shadow Vocabulary

- **Card Shadow** (`box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`): Contenedores, cards, paneles de filtros.

### Named Rules

**La Regla Plana por Defecto.** Las superficies son planas en reposo. Las sombras son sutiles (solo un rayo de luz). La profundidad la da el stacking de fondos, no la elevación.

## 5. Components

### Buttons

- **Shape:** Esquinas medias (0.5rem / `rounded-lg`)
- **Primary:** Fondo gris carbón (#1a1a1a), texto blanco, padding 0.5rem 1rem. Hover oscurece a #0d0d0d. Disabled reduce opacidad a 50%.
- **Icon Button:** Cuadrado 36x36px, icono centrado. Hover: fondo gris-100. Sin borde.
- **Ghost/Link:** Texto gris-600, hover texto primario. Sin fondo ni borde.
- **Transición:** `transition-colors` con duración 200ms, easing default.

### Cards / Containers

- **Corner Style:** Esquinas suaves (0.75rem / `rounded-xl`)
- **Background:** Blanco (#ffffff) en modo claro, gris-900 (#111827) en oscuro
- **Shadow Strategy:** shadow-sm (ver Elevación)
- **Border:** 1px solid, border-gray-200 claro, border-gray-800 oscuro
- **Internal Padding:** 1rem–1.5rem (p-4 a p-6)
- **Uso:** Dashboards, listas con filtros, paneles de detalle

### Inputs / Fields

- **Style:** Borde sólido 1px `border-gray-300` (#d1d5db), fondo blanco, esquinas medianas (0.5rem)
- **Focus:** Anillo doble: `ring-2 ring-primary-500` + cambio de borde a `border-primary-500`. Outline removido.
- **Padding:** 0.625rem 1rem (py-2.5 px-4)
- **Error / Disabled:** Sin estilos específicos; validación vía toast/sonner. Disabled: opacidad reducida + cursor not-allowed.

### Navigation (Sidebar)

- **Style:** Vertical, ancho fijo 16rem (w-64), fondo blanco/gris-900
- **Items:** Padding 0.75rem 0.75rem, rounded-lg, gap 0.75rem
- **Default:** Texto gris-600, hover fondo gris-100 + texto gris-900
- **Active:** Fondo primary-50, texto primary-700. En dark: fondo primary-900/30, texto primary-300
- **Mobile:** Drawer con overlay, transición translate-x, toggle button fixed top-4 left-4

### Badges / Tags

- **Style:** Inline-flex, padding 0.25rem 0.5rem, rounded-lg (0.5rem), font-size 0.75rem, font-weight 500
- **Colores contextuales:** 
  - Verde claro (#dcfce7) fondo, verde oscuro (#15803d) texto → activo/success
  - Rojo claro (#fee2e2) fondo, rojo oscuro (#b91c1c) texto → inactivo/error
  - Amarillo claro (#fef9c3) fondo, amarillo oscuro (#a16207) texto → warning

### Tables

- **Style:** Full width, text-sm, sin bordes verticales
- **Header:** Fondo gris-50 (`bg-gray-50`), texto gris-500 font-medium, padding 0.75rem 1rem
- **Rows:** Borde inferior 1px gris-100, hover fondo gris-50
- **Pagination:** Botones rounded-lg, activo primary-600 text-white, inactivo texto gris-600 hover gris-200

### Loading State

- **Spinner:** Lucide `Loader2` con `animate-spin`, 32x32px, color primary-600. Centrado en contenedor con padding vertical.

## 6. Do's and Don'ts

### Do:

- **Do** usar la escala de grises primaria como color de acción principal (botones, enlaces activos, paginación activa).
- **Do** mantener las cards con fondo blanco, borde 1px y shadow-sm consistente en todo el sistema.
- **Do** usar los acentos semánticos solo para estado: verde = ok, rojo = error, ámbar = warning, azul = info.
- **Do** usar rounded-lg (0.5rem) en inputs y botones, rounded-xl (0.75rem) en cards de forma consistente.
- **Do** transicionar solo `transition-colors` en elementos interactivos. Nada de transform, escala, o rotación en hover.
- **Do** mantener el espaciado generoso (p-4 a p-6 en cards) para que los datos respiren.

### Don't:

- **Don't** agregar colores decorativos fuera del sistema semántico. Sin gradientes, sin fondos de color en headers, sin acentos cool.
- **Don't** sobrecargar el dashboard con información sin jerarquía. Un card = un bloque de información, no un dump de datos.
- **Don't** usar sombras múltiples, glassmorphism, o fondos texturizados. El sistema es plano con sombras suaves.
- **Don't** variar radios de esquina inconsistentemente. Sistema: 0.5rem (inputs/botones/badges), 0.75rem (cards), 1rem (login card).
- **Don't** mezclar estilos de botones inline. Si es botón primario, es primary-600 sólido. No variantes con borde + fondo.
- **Don't** truncar texto importante en headings o tablas sin ellipsis visible. Ajusta el layout antes.
