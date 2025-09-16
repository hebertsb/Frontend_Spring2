import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface BackendStatusProps {
  className?: string;
}

export function BackendStatus({ className }: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [backendUrl, setBackendUrl] = useState('');

  useEffect(() => {
    const checkBackendStatus = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/';
      setBackendUrl(apiUrl);
      
      try {
        // Intentar hacer ping al backend
        await axios.get(apiUrl.replace('/api/', '/health/'), { timeout: 3000 });
        setStatus('online');
      } catch {
        // Si no hay endpoint de health, intentar con el endpoint de auth
        try {
          await axios.get(`${apiUrl}auth/`, { timeout: 3000 });
          setStatus('online');
        } catch {
          setStatus('offline');
        }
      }
    };

    checkBackendStatus();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Verificando conexión con el backend...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'offline') {
    return (
      <Alert variant="destructive" className={className}>
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          ❌ Backend no disponible en <code className="text-xs">{backendUrl}</code>
          <br />
          <span className="text-xs mt-1 block">
            Asegúrate de que tu servidor Django esté ejecutándose.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`${className} border-green-200 bg-green-50`}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        ✅ Backend conectado correctamente
      </AlertDescription>
    </Alert>
  );
}
