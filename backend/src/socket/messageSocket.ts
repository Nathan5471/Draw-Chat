import { Server, Socket } from "socket.io";
import { parse } from "cookie";
import authenticate from "../utils/authenticate";
import {
  getChatData,
  getUserChats,
  getChatMessages,
  sendMessage,
} from "../controllers/messageController";
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

    socket.on("getUserChats", async () => {
      try {
        const chats = await getUserChats(user);
        chats.forEach((chat) => {
          socket.join(`chat_${chat.id}`);
        });
        socket.emit("userChats", chats);
      } catch (error) {
        console.error("Error in getting user chats:", error);
        socket.emit("error", "Failed to fetch user chats");
      }
    });

    socket.on("getChatMessages", async (data: { chatId: number }) => {
      try {
        const messages = await getChatMessages(user, data.chatId);
        socket.emit("chatMessages", { chatId: data.chatId, messages });
      } catch (error) {
        console.error("Error in getting chat messages:", error);
        socket.emit("error", "Failed to fetch chat messages");
      }
    });

    socket.on(
      "sendMessage",
      async (data: { chatId: number; content: string }) => {
        try {
          const message = await sendMessage(user, data.chatId, data.content);
          io.to(`chat_${data.chatId}`).emit("newMessage", {
            chatId: data.chatId,
            message,
          });
          io.emit("messageSent", { chatId: data.chatId, message });
        } catch (error) {
          console.error("Error in sending message:", error);
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", user.username);
    });
  });
};

export default messageSocket;
