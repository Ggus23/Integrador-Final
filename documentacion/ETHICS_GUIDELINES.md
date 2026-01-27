# Pautas de Ética y Privacidad

## IA Responsable y Manejo de Datos
MENTALINK utiliza enfoques algorítmicos para analizar datos de salud mental. Nos adherimos a estrictas pautas éticas para garantizar la seguridad y privacidad del usuario.

### 1. Naturaleza No Diagnóstica
La plataforma declara explícitamente que no sustituye el consejo, diagnóstico o tratamiento médico profesional. Todos los resultados de la IA se denominan "insights" o "indicadores de riesgo", no diagnósticos.

### 2. Consentimiento Informado
Los usuarios deben ser informados sobre:
- Qué datos se recopilan (respuestas, chequeos, patrones de uso).
- Cómo se analizan los datos (algoritmos de puntuación, modelos de ML).
- Quién tiene acceso a los datos.
- El derecho a retirar el consentimiento y eliminar datos.

### 3. Minimización de Datos y Privacidad
- Solo se recopilan los datos necesarios para el servicio.
- La Información de Identificación Personal (PII) debe manejarse con cuidado y almacenarse de forma segura.
- Recomendaciones para producción: Cifrar campos sensibles, usar controles de acceso estrictos (RBAC).

### 4. Supervisión Humana
Las alertas de alto riesgo idealmente deberían ser revisadas por un profesional humano (cuando sea aplicable en el contexto de implementación) o activar recursos inmediatos (líneas de ayuda) en lugar de acciones puramente automatizadas.

### 5. Transparencia Algorítmica
Nos esforzamos por hacer que la lógica de puntuación y evaluación de riesgos sea transparente y explicable. Ver `app/ml/explainer.py` (cuando se implemente) para características de explicabilidad del modelo.
