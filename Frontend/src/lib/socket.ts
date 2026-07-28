import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Lazy singleton — the JWT lives in the same httpOnly cookie used by `api.ts`
 * (`withCredentials: true` sends it on the WS handshake), so no separate auth
 * step is needed. Connecting to `undefined` targets the current page origin,
 * which the dev proxy (`vite.config.ts`) forwards to the API server.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? undefined, {
      path: '/socket.io',
      withCredentials: true,
    });
  }
  return socket;
}
