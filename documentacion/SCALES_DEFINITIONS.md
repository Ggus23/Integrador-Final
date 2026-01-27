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

## DASS-21 (Escalas de Depresión, Ansiedad y Estrés)
Un conjunto de tres escalas de autoinforme diseñadas para medir los estados emocionales de depresión, ansiedad y estrés.

### Puntuación (x2 para comparabilidad completa con DASS)
Cada escala (D, A, S) tiene 7 ítems. Las puntuaciones se suman y se multiplican por 2.
- **Depresión**: Normal (0-9), Leve (10-13), Moderada (14-20), Severa (21-27), Extremadamente Severa (28+)
- **Ansiedad**: Normal (0-7), Leve (8-9), Moderada (10-14), Severa (15-19), Extremadamente Severa (20+)
- **Estrés**: Normal (0-14), Leve (15-18), Moderada (19-25), Severa (26-33), Extremadamente Severa (34+)

## Lógica de Riesgo
MENTALINK mapea estas puntuaciones a niveles de riesgo ("Bajo", "Medio", "Alto") para activar intervenciones o alertas apropiadas. Esta **no es una herramienta de diagnóstico**.

- **Implementación**: Ver `app/services/scoring_service.py` y `app/services/risk_service.py`.
