# Guía de Integración Frontend de Mentalink (Next.js + TypeScript)

Esta guía explica cómo consumir la API Backend de Mentalink desde un frontend de Next.js, centrándose en la obtención segura de datos y la autenticación.

## 1. Configuración del Cliente API

Use una biblioteca como `axios` o la API nativa `fetch`. Se recomienda crear un cliente centralizado que adjunte automáticamente el JWT.

```typescript
// frontend/lib/api-client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
});

// Adjuntar token JWT a cada solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 2. Consumiendo Chequeos Emocionales (Check-ins)

Ejemplo de un componente de dashboard que permite a un estudiante registrar su estado de ánimo.

```tsx
// frontend/components/EmotionalCheckin.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/api-client';

export default function MoodSelector() {
  const [mood, setMood] = useState(3);
  const [loading, setLoading] = useState(false);

  const saveCheckin = async () => {
    setLoading(true);
    try {
      await api.post('/checkins/', { mood_score: mood });
      alert('¡Ánimo registrado! Cuídate.');
    } catch (err) {
      console.error('Error al guardar el checkin', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold">¿Cómo te sientes hoy?</h3>
      <div className="flex gap-4 my-4">
        {[1, 2, 3, 4, 5].map((val) => (
          <button 
            key={val}
            onClick={() => setMood(val)}
            className={`p-2 rounded ${mood === val ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            {val}
          </button>
        ))}
      </div>
      <button 
        onClick={saveCheckin}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? 'Guardando...' : 'Enviar'}
      </button>
    </div>
  );
}
```

## 3. Manejo del Consentimiento Informado (RBAC/Gatekeeper)

El frontend debe verificar la aceptación del consentimiento antes de permitir que los usuarios accedan a las evaluaciones.

```tsx
// frontend/components/ConsentGuard.tsx
import { useEffect, useState } from 'react';
import api from '@/lib/api-client';

export default function ConsentGuard({ children }: { children: React.ReactNode }) {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    api.get('/consents/me')
      .then(res => setHasAccepted(res.data.has_accepted))
      .catch(() => setHasAccepted(false));
  }, []);

  if (hasAccepted === null) return <div>Cargando...</div>;
  if (!hasAccepted) return <ConsentForm onAccept={() => setHasAccepted(true)} />;

  return <>{children}</>;
}
```

## 4. Control de Acceso Basado en Roles (RBAC)

Verifique el campo `role` del perfil de usuario devuelto por `/api/v1/users/me` para alternar funciones.

```tsx
// Solo mostrar 'Reportes Institucionales' si el usuario es ADMIN
{user.role === 'admin' && <AdminReportSection />}
```
