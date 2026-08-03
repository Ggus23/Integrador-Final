import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export function CognitiveReframing({ metadata }: { metadata?: any }) {
  const initialTasks = metadata?.tasks || [
    { id: '1', text: 'Identificar el pensamiento exacto que me causa estrés', completed: false },
    {
      id: '2',
      text: 'Evaluar: ¿Tengo pruebas reales de que esto es 100% cierto?',
      completed: false,
    },
    { id: '3', text: 'Escribir una alternativa más realista y compasiva', completed: false },
  ];

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const progress = (tasks.filter((t) => t.completed).length / tasks.length) * 100;

  return (
    <div className="bg-card border-border/50 relative overflow-hidden rounded-2xl border p-6 shadow-sm">
      {/* Progress background glow */}
      <div
        className="from-primary/50 to-primary absolute top-0 left-0 h-1 bg-gradient-to-r transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />

      <h3 className="text-primary mb-1 font-serif text-lg">Reencuadre Cognitivo</h3>
      <p className="text-muted-foreground mb-6 text-sm">
        {metadata?.description || 'Desglosa tu estrés en pasos pequeños y manejables.'}
      </p>

      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
              task.completed
                ? 'bg-primary/10 border-primary/20'
                : 'bg-background/50 border-border/50 hover:bg-muted'
            }`}
            onClick={() => toggleTask(task.id)}
          >
            <div className={`mt-0.5 ${task.completed ? 'text-primary' : 'text-muted-foreground'}`}>
              {task.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} className="opacity-40" />
              )}
            </div>
            <span
              className={`text-sm ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground/90'}`}
            >
              {task.text}
            </span>
          </motion.div>
        ))}
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary/20 border-primary/20 mt-6 rounded-xl border p-4 text-center"
        >
          <span className="text-primary text-sm font-semibold">
            ¡Excelente trabajo procesando este pensamiento! 🌿
          </span>
        </motion.div>
      )}
    </div>
  );
}
