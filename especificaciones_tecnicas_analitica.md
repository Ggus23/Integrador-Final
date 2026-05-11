# Informe Técnico: Módulo de Analítica Predictiva MenTaLink

Este documento detalla la arquitectura de datos, herramientas y metodología aplicadas en el desarrollo del módulo de analítica para el proyecto **MenTaLink**, enfocado en la correlación entre el bienestar emocional (ARI) y el rendimiento académico.

---

## 1. Clasificación de los Datos

Desde la perspectiva de la Ciencia de Datos, los datos procesados en este módulo se clasifican de la siguiente manera:

### Según su Estructura: **Datos Estructurados**
Utilizamos **datos estructurados** porque la información se organiza en un formato tabular (filas y columnas) con un esquema predefinido. Cada columna representa una variable específica y cada fila un registro único (estudiante). Este formato es ideal para algoritmos de aprendizaje automático supervisado como la Regresión Lineal.

### Según su Formato (Tipos de Datos Python/Pandas)
| Variable | Formato Técnico | Naturaleza |
| :--- | :--- | :--- |
| **Estudiante** | `int64` | Discreta (Identificador único) |
| **ARI** | `float64` | Continua (Valores de 0.0 a 10.0) |
| **H1 - H5** | `float64` | Continua (Puntajes de 0.0 a 25.0) |
| **Nota_Final** | `float64` | Continua (Suma acumulada de 0.0 a 100.0) |

### Según su Contenido y Rol en el Modelo
1.  **Variable Independiente ($X$):** El **Academic Risk Index (ARI)**. Es la variable predictora que representa el estado emocional/riesgo del alumno.
2.  **Variables Dependientes ($Y$):** Los hitos académicos y la **Nota Final**. Son las variables respuesta cuyo valor depende teóricamente del nivel de riesgo.

---

## 2. Stack Tecnológico y Justificación

Para este módulo se seleccionó el ecosistema estándar de Ciencia de Datos en Python ("The SciPy Stack"):

| Herramienta | Función Principal | Justificación Técnica |
| :--- | :--- | :--- |
| **NumPy** | Generación de datos sintéticos | Permite realizar operaciones vectorizadas y aplicar funciones estadísticas (como la distribución normal para el ruido) con alta eficiencia computacional. |
| **Pandas** | Manipulación de DataFrames | Es la librería por excelencia para el manejo de datos estructurados, permitiendo realizar agregaciones (como la suma de hitos) de forma sencilla. |
| **Scikit-Learn** | Modelado Predictivo | Proporciona la implementación de `LinearRegression`, un algoritmo robusto y eficiente para encontrar la relación lineal entre variables continuas. |
| **Seaborn / Matplotlib** | Visualización de Datos | Permiten realizar el análisis exploratorio de datos (EDA), visualizando la dispersión y la línea de tendencia para validar visualmente la hipótesis de correlación. |

---

## 3. Metodología: Regresión Lineal Simple

El núcleo del módulo utiliza un modelo de **Regresión Lineal Simple** para modelar la relación entre el ARI ($X$) y la Nota Final ($Y$).

### El Proceso:
1.  **Entrenamiento:** El modelo busca la "Línea de Mejor Ajuste" minimizando la suma de los cuadrados de los errores (MSE).
2.  **Validación ($R^2$):** Utilizamos el Coeficiente de Determinación para saber qué porcentaje de la variabilidad de las notas es explicada por el ARI. Un $R^2$ cercano a 1.0 valida que nuestra hipótesis de correlación inversa es sólida.
3.  **Inferencia:** La función `alerta_temprana` utiliza la ecuación aprendida ($Y = mx + b$) para proyectar resultados futuros basados en nuevos valores de ARI.

---

## 4. Conclusión del Experto
El uso de **datos estructurados** y un modelo de **regresión lineal** es la elección más eficiente para este caso de uso. Al tener variables numéricas continuas y una relación clara de causa-efecto (riesgo vs. nota), este enfoque permite obtener una **capacidad de interpretación directa**: el coeficiente de la regresión nos dice exactamente cuánto impacto tiene el bienestar emocional en los puntos académicos, lo cual es vital para la justificación científica de la tesis de MenTaLink.
