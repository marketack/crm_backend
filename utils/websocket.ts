import { Server } from "socket.io";
import { INotification } from "../models/notification.model";

let io: Server;

export const initializeSocket = (server: any) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("🔴 A user disconnected:", socket.id);
    });
  });

  return io;
};

export const sendNotification = (userId: string, notification: INotification) => {
  io.emit(`notification-${userId}`, notification);
};
