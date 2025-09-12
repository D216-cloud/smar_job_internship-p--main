import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  backend: boolean;
  database: boolean;
  lastCheck: string;
}

export function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'unknown',
    backend: false,
    database: false,
    lastCheck: 'Never'
  });

  const checkHealth = async () => {
    try {
      // Check if backend is accessible
      const response = await fetch('/api/health', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealth({
          status: 'healthy',
          backend: true,
          database: data.database || false,
          lastCheck: new Date().toLocaleTimeString()
        });
      } else {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        backend: false,
        database: false,
        lastCheck: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant="outline"
        className={`flex items-center gap-2 px-3 py-1 ${getStatusColor()}`}
        onClick={checkHealth}
        style={{ cursor: 'pointer' }}
        title="Click to refresh health status"
      >
        {getStatusIcon()}
        <span className="text-xs">
          Backend: {health.backend ? 'OK' : 'ERROR'}
        </span>
        <span className="text-xs opacity-60">
          {health.lastCheck}
        </span>
      </Badge>
    </div>
  );
}