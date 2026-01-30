# Definiciones de Escalas Psicométricas y Puntuación

## Escala de Estrés Percibido (PSS)
La Escala de Estrés Percibido (PSS) es el instrumento psicológico más utilizado para medir la percepción del estrés. Es una medida del grado en que las situaciones en la vida de uno se evalúan como estresantes.

### Puntuación
- **Ítems**: 10 ítems.
- **Rango**: 0-4 por ítem.
- **Interpretación**:
    - 0-13: Estrés bajo
    - 14-26: Estrés moderado
    - 27-40: Alto estrés percibido

## Escala de Ansiedad Generalizada (GAD-7)
Instrumento breve para detectar síntomas de ansiedad generalizada.
- **Ítems**: 7 preguntas.
- **Rango**: 0-3 por ítem (0=Nunca, 3=Casi todos los días).
- **Interpretación (Spitzer et al., 2006)**:
    - 0-4: Ansiedad Mínima (Riesgo Bajo)
    - 5-9: Ansiedad Leve (Riesgo Bajo)
    - 10-14: Ansiedad Moderada (Riesgo Medio)
    - 15-21: Ansiedad Severa (Riesgo Alto)

## Cuestionario sobre la Salud del Paciente (PHQ-9)
Módulo de depresión diseñado para facilitar el reconocimiento de trastornos depresivos.
- **Ítems**: 9 preguntas.
- **Rango**: 0-3 por ítem.
- **Interpretación (Kroenke et al., 2001)**:
    - 0-4: Ninguna (Riesgo Bajo)
    - 5-9: Leve (Riesgo Bajo)
    - 10-14: Moderada (Riesgo Medio)
    - 15-19: Moderadamente Severa (Riesgo Alto)
    - 20-27: Severa (Riesgo Alto)

## Lógica de Riesgo
MENTALINK mapea estas puntuaciones a niveles de riesgo ("Bajo", "Medio", "Alto") para activar intervenciones o alertas apropiadas. Esta **no es una herramienta de diagnóstico**.

- **Implementación**: Ver `app/services/scoring_service.py` y `app/services/risk_service.py`.

## Nota sobre Infraestructura de Datos
Para garantizar la integridad referencial estricta requerida por los protocolos de ética (borrado en cascada de datos sensibles al eliminar usuarios), el sistema utiliza **PostgreSQL 16** como motor de base de datos relacional.
