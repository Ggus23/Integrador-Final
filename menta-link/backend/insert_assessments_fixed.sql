-- Insertar assessments con formato correcto para el frontend

INSERT INTO assessments (title, description, type, items) VALUES
(
  'Escala de Estrés Percibido (PSS-10)',
  'Mide el grado en el cual los eventos de la vida se perciben como impredecibles, incontrolables y sobrecargantes.',
  'PSS-10',
  '[
    {"id": 1, "text": "En el último mes, ¿con qué frecuencia has estado preocupado por algo inesperado?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 2, "text": "En el último mes, ¿con qué frecuencia has sentido que eres incapaz de controlar las cosas importantes de tu vida?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 3, "text": "En el último mes, ¿con qué frecuencia te has sentido nervioso o estresado?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 4, "text": "En el último mes, ¿con qué frecuencia te has sentido seguro de tu capacidad de manejar tus problemas personales?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 5, "text": "En el último mes, ¿con qué frecuencia has sentido que las cosas marchan como esperas?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 6, "text": "En el último mes, ¿con qué frecuencia has encontrado que no podías hacer frente a todas las cosas que tenías que hacer?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 7, "text": "En el último mes, ¿con qué frecuencia has sido capaz de controlar la forma de pasar tu tiempo?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 8, "text": "En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 9, "text": "En el último mes, ¿con qué frecuencia has estado irritable o malhumorado?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"},
    {"id": 10, "text": "En el último mes, ¿con qué frecuencia has sentido que estabas en la cima del mundo sin razón aparente?", "scale_min": 0, "scale_max": 4, "scale_min_label": "Nunca", "scale_max_label": "Muy frecuentemente"}
  ]'
);

INSERT INTO assessments (title, description, type, items) VALUES
(
  'Escala de Depresión, Ansiedad y Estrés (DASS-21)',
  'Mide síntomas de depresión, ansiedad y estrés. Escala de 21 ítems que proporciona evaluación rápida y confiable.',
  'DASS-21',
  '[
    {"id": 1, "text": "Me encontré difícil relajarme", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 2, "text": "Fui consciente de sequedad en mi boca", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 3, "text": "No pude experimentar sentimientos positivos", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 4, "text": "Experimenté dificultad para respirar", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 5, "text": "Me resultó difícil tomar iniciativa para hacer cosas", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 6, "text": "Tendí a reaccionar de forma exagerada ante situaciones", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 7, "text": "Experimenté temblores", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 8, "text": "Sentí que estaba utilizando mucha energía nerviosa", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 9, "text": "Me preocupé por situaciones donde podría parecer en pánico o hacer un ridículo", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 10, "text": "Sentí que no tenía nada que esperar", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 11, "text": "Me encontré a mí mismo inquieto", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 12, "text": "Me resultó difícil relajarme", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 13, "text": "Me sentí desanimado y malhumorado", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 14, "text": "Fui consciente del latido acelerado del corazón a pesar del reposo físico", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 15, "text": "Me sentí asustado sin razón alguna", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 16, "text": "Sentí que la vida era sin sentido", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 17, "text": "Me encontré fácilmente en un estado de pánico", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 18, "text": "Encontré difícil calmarme después de estar asustado", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 19, "text": "Temí que pudiera tener un ataque de pánico", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 20, "text": "Me sentí incapaz de entusiasmarme por nada", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"},
    {"id": 21, "text": "Sentí que no valía mucho como persona", "scale_min": 0, "scale_max": 3, "scale_min_label": "No, nunca", "scale_max_label": "Sí, la mayoría del tiempo"}
  ]'
);
