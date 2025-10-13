import { Server, Socket } from "socket.io";
import { parse } from "cookie";
import authenticate from "../utils/authenticate";
import { User } from "@prisma/client";

const messageSocket = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error("Unauthorized"));
    }

    const { token } = parse(cookies);
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const user = (await authenticate(token)) as User;
      (socket as any).user = user;
      next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as User;
    console.log("User connected:", user.username);

    socket.on("disconnect", () => {
      console.log("User disconnected:", user.username);
    });
  });
};

export default messageSocket;
