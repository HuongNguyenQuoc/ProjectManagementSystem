import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { COOKIE_NAME, JWT_SECRET } from "../../config/env.js";
import { findUserById } from "../repositories/user.repository.js";
import { getProjectAccess } from "../services/projectAccess.js";
import { findTaskById } from "../repositories/task.repository.js";
import type { CommentDto } from "../services/comment.service.js";

let io: Server | null = null;

const taskRoom = (taskId: string) => `task:${taskId}`;

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: true, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, COOKIE_NAME as string);
      if (!token) return next(new Error("Authentication token is missing"));

      const payload = jwt.verify(token, JWT_SECRET as string) as { userId: string };
      const user = await findUserById(payload.userId);
      if (!user || user.status !== "ACTIVE") return next(new Error("Invalid or expired session"));

      socket.data.userId = user.id;
      socket.data.userRole = user.role;
      next();
    } catch {
      next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join-task", async ({ projectId, taskId }: { projectId?: string; taskId?: string }) => {
      if (!projectId || !taskId) return;
      const task = await findTaskById(taskId);
      if (!task || task.projectId !== projectId) return;

      const { isMember } = await getProjectAccess(projectId, socket.data.userId, socket.data.userRole);
      if (!isMember) return;

      await socket.join(taskRoom(taskId));
    });

    socket.on("leave-task", ({ taskId }: { taskId?: string }) => {
      if (!taskId) return;
      void socket.leave(taskRoom(taskId));
    });
  });

  return io;
}

/** Broadcast a newly created comment to everyone currently viewing that task. */
export function emitNewComment(taskId: string, comment: CommentDto) {
  io?.to(taskRoom(taskId)).emit("comment:new", comment);
}
