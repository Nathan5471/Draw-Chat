import { Server, Socket } from "socket.io";
import { parse } from "cookie";
import authenticate from "../utils/authenticate";
import {
  getChatData,
  getUserChats,
  getChatMessages,
  sendMessage,
  loadMessage,
  createChat,
} from "../controllers/messageController";
import { checkUsername } from "../controllers/authController";
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
    socket.join(`user_${user.id}`);
    console.log("User connected:", user.username);

    socket.on("getUserChats", async () => {
      try {
        const chats = await getUserChats(user);
        chats.forEach((chat) => {
          socket.join(`chat_${chat.id}`);
        });
        socket.emit("userChats", { chats });
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
      async (data: { chatId: number; content: string[] }) => {
        try {
          const message = await sendMessage(user, data.chatId, data.content);
          io.to(`chat_${data.chatId}`).emit("newMessage", {
            chatId: data.chatId,
            message,
          });
          socket.emit("messageSent", { chatId: data.chatId, message });
        } catch (error) {
          console.error("Error in sending message:", error);
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on("loadMessage", async (data: { messageId: number }) => {
      try {
        const { chatId, message } = await loadMessage(user, data.messageId);
        socket.emit("messageLoaded", { chatId, message });
      } catch (error) {
        console.error("Error loading message:", error);
        socket.emit("error", "Failed to load message");
      }
    });

    socket.on("startChat", async (data: { username: string }) => {
      try {
        const usernameExists = await checkUsername(data.username);
        if (!usernameExists) {
          socket.emit("chatStartingError", "Username doesn't exist");
          return;
        }
        const chat = await createChat(user, data.username);
        chat.users.forEach((user) => {
          io.to(`user_${user.id}`).emit("newChat", { chat });
        });
        socket.emit("chatCreated", { id: chat.id });
      } catch (error) {
        console.error("Error starting chat:", error);
        socket.emit("chatStartingError", "Failed to start chat");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", user.username);
    });
  });
};

export default messageSocket;
