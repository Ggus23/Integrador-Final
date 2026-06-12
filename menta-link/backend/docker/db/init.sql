-- Script inicial opcional para PostgreSQL (se ejecuta solo la primera vez)

-- Ejemplo: crear esquema separado para mentalink
CREATE SCHEMA IF NOT EXISTS mentalink AUTHORIZATION CURRENT_USER;

-- Opcional: crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insertar assessments/cuestionarios psicométricos
INSERT INTO assessments (title, description, type, items) VALUES
(
  'Escala de Estrés Percibido (PSS-10)',
  'Mide el grado en el cual los eventos de la vida se perciben como impredecibles, incontrolables y sobrecargantes. Utilizada para evaluar el estrés percibido.',
  'PSS-10',
  '[
    {"id": 1, "text": "En el último mes, ¿con qué frecuencia has estado preocupado o disgustado por algo inesperado?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 2, "text": "En el último mes, ¿con qué frecuencia has sentido que eres incapaz de controlar las cosas importantes de tu vida?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 3, "text": "En el último mes, ¿con qué frecuencia te has sentido nervioso o estresado?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 4, "text": "En el último mes, ¿con qué frecuencia te has sentido seguro de tu capacidad de manejar tus problemas personales?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 5, "text": "En el último mes, ¿con qué frecuencia has sentido que las cosas marchan como esperas?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 6, "text": "En el último mes, ¿con qué frecuencia has encontrado que no podías hacer frente a todas las cosas que tenías que hacer?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 7, "text": "En el último mes, ¿con qué frecuencia has sido capaz de controlar la forma de pasar tu tiempo?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 8, "text": "En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 9, "text": "En el último mes, ¿con qué frecuencia has estado irritable o malhumorado?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]},
    {"id": 10, "text": "En el último mes, ¿con qué frecuencia has sentido que estabas en la cima del mundo sin razón aparente?", "options": ["Nunca", "Casi nunca", "A veces", "Frecuentemente", "Muy frecuentemente"]}
  ]'
) ON CONFLICT (title) DO NOTHING;

INSERT INTO assessments (title, description, type, items) VALUES
(
  'Escala de Depresión, Ansiedad y Estrés (DASS-21)',
  'Mide síntomas de depresión, ansiedad y estrés. Es una escala de 21 ítems que proporciona una evaluación rápida y confiable.',
  'DASS-21',
  '[
    {"id": 1, "text": "Me encontré difícil relajarme", "category": "stress", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 2, "text": "Fui consciente de sequedad en mi boca", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 3, "text": "No pude experimentar sentimientos positivos", "category": "depression", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 4, "text": "Experimenté dificultad para respirar", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 5, "text": "Me resultó difícil tomar iniciativa para hacer cosas", "category": "depression", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 6, "text": "Tendí a reaccionar de forma exagerada ante situaciones", "category": "stress", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 7, "text": "Experimenté temblores", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 8, "text": "Sentí que estaba utilizando mucha energía nerviosa", "category": "stress", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 9, "text": "Me preocupé por situaciones donde podría parecer en pánico o hacer un ridículo", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 10, "text": "Sentí que no tenía nada que esperar", "category": "depression", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 11, "text": "Me encontré a mí mismo inquieto", "category": "stress", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 12, "text": "Me resultó difícil relajarme", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 13, "text": "Me sentí desanimado y malhumorado", "category": "depression", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 14, "text": "Fui consciente del latido acelerado del corazón a pesar del reposo físico", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 15, "text": "Me sentí asustado sin razón alguna", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 16, "text": "Sentí que la vida era sin sentido", "category": "depression", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 17, "text": "Me encontré fácilmente en un estado de pánico", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 18, "text": "Encontré difícil calmarme después de estar asustado", "category": "stress", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 19, "text": "Temí que pudiera tener un ataque de pánico", "category": "anxiety", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 20, "text": "Me sentí incapaz de entusiasmarme por nada", "category": "depression", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]},
    {"id": 21, "text": "Sentí que no valía mucho como persona", "category": "depression", "options": ["No, nunca", "Sí, algunas veces", "Sí, con frecuencia", "Sí, la mayoría del tiempo"]}
  ]'
) ON CONFLICT (title) DO NOTHING;