# 📔 MentaLink Mobile: Diario Emocional (React Native)

Este documento contiene las reglas de diseño, lógica y prompt estratégico para crear el módulo de **Diario Emocional** móvil de MentaLink utilizando **React Native**.

## 🚀 Objetivo General
Crear una experiencia de usuario nativa e introspectiva que permita al estudiante registrar su estado emocional en menos de 60 segundos, manteniendo la estética "Oasis" de la plataforma.

---

## 🎨 Especificaciones de Diseño (Oasis DNA)

### 1. Paleta de Colores
*   **Fondo Principal (Modo Oscuro):** `#1a2a3a` (Azul Petróleo Profundo).
*   **Fondo de Tarjetas:** `rgba(20, 35, 50, 0.75)` con efecto de transparencia (Glass).
*   **Acento Primario (Coral):** `#e09a70`.
*   **Acento Secundario (Salvia):** `#9fca9f`.
*   **Estados de Ánimo:**
    *   Nivel 5: `#22c55e` (Verde) - 😄
    *   Nivel 4: `#86efac` (Verde claro) - 🙂
    *   Nivel 3: `#facc15` (Amarillo) - 😐
    *   Nivel 2: `#f97316` (Naranja) - 🙁
    *   Nivel 1: `#ef4444` (Rojo) - 😢

### 2. Tipografía y Estilo
*   **Fuentes:** 'Lora' (Serif) para títulos de tarjetas y 'DM Sans' para textos de lectura.
*   **Bordes:** `borderRadius: 24` para un look moderno y amigable.
*   **Interactividad:** Feedback visual inmediato al tocar (Scale up/down).

---

## 🛠️ Reglas Técnicas para React Native

### 1. Stack Sugerido
*   **Estilos:** `Nativewind` (Tailwind para RN) o `StyleSheet` modular.
*   **Animaciones:** `react-native-reanimated` y `moti` (para efectos de entrada sutiles).
*   **Iconos:** `lucide-react-native` y Emojis nativos del sistema.
*   **Navegación:** `React Navigation` (Stack o Tabs).

### 2. Componentes Clave
*   **EmotionSelector:** Una fila de 5 botones circulares o redondeados con animaciones de "Spring".
*   **GuidedJournaling:** Un input multilínea (`TextInput` con `multiline={true}`) que cambie su `placeholder` dinámicamente con consejos o preguntas.
*   **MobileCloud:** Una visualización adaptada a scroll horizontal para palabras clave (Word Cloud).
*   **TimelineCard:** Un ítem de lista optimizado con un borde lateral de color para revisión rápida.

---

## 🧭 Flujo de Usuario (Mobile Step-by-Step)

1.  **Check-in Rápido:** El usuario selecciona un emoji de ánimo. El fondo de la pantalla cambia sutilmente de tonalidad según la selección.
2.  **Reflexión Guiada:** Se muestra un prompt aleatorio (ej: "¿Hubo algo que te hizo sentir un reto?").
3.  **Tags de Actividad:** Entrada rápida de texto para actividades (separadas por comas o tags visuales).
4.  **Guardado Háptico:** Al guardar, se dispara una pequeña vibración (haptics) y una transición de éxito.

---

## 🤖 Prompt para Herramienta de IA / Autodesarrollo

> "Eres un experto en **React Native (Expo)** y **Lucide React**. Crea un componente de pantalla llamado **DiaryEntryScreen** para la app MentaLink siguiendo estas reglas:
> 
> 1. **Estética Oasis:** Fondo azul petróleo profundo (#1a2a3a) y tarjetas con bordes muy redondeados (24px) y ligeras transparencia.
> 2. **Selector de Ánimo:** 5 botones horizontales con emojis. Al seleccionar uno, debe 'saltar' sutilmente usando `react-native-reanimated`.
> 3. **Input de Reflexión:** Un área de texto que use la fuente 'Lora' (si es posible) y un placeholder que pregunte algo introspectivo.
> 4. **Historial:** Debajo del formulario, muestra las últimas entradas en tarjetas compactas con el emoji a la izquierda y el texto resumido a la derecha.
> 5. **Modo Oscuro nativo:** Asegura que los contrastes sean legibles para estudiantes. 
> 6. **Lógica de Estado:** Maneja el estado local para `mood`, `text` y `tags`. No es necesario backend funcional ahora, usa datos mock para el historial."

---

## 📝 Ejemplo de Estructura de Datos (JSON)
```json
{
  "emotion": "Muy feliz",
  "level": 5,
  "experience": "Hoy termine mi proyecto de IA!",
  "activities": "Estudio, Programación",
  "date": "2026-03-27"
}
```
