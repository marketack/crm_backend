import { Server } from "socket.io";
let io;
export const initializeSocket = (server) => {
    io = new Server(server, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
        console.log("🟢 A user connected:", socket.id);
        socket.on("disconnect", () => {
            console.log("🔴 A user disconnected:", socket.id);
        });
    });
    return io;
};
export const sendNotification = (userId, notification) => {
    io.emit(`notification-${userId}`, notification);
};
