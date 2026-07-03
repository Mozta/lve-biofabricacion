import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

// Estado de conexión + posición, por polling (sin WebSocket en Fase 1).
export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: api.status,
    refetchInterval: 2000,
    retry: false,
  });
}
