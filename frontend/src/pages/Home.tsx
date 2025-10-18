import { useState, useEffect } from "react";
import socket from "../socket";

export default function Home() {
  interface User {
    id: number;
    username: string;
  }
  interface Chat {
    id: number;
    users: User[];
    unreadMessages: number;
  }
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null); // The chat id
  interface Message {
    id: number;
    content: string;
    user: User;
    createdAt: Date;
    updateAt: Date;
  }
  const [selectedChatMessages, setSelectedChatMessages] = useState<Message[]>(
    []
  );

  useEffect(() => {
    socket.emit("getUserChats");

    socket.on("userChats", (data: { chats: Chat[] }) => {
      setChats(data.chats);
    });

    socket.on(
      "getChatMessages",
      (data: { chatId: number; messages: Message[] }) => {
        if (data.chatId !== selectedChat) {
          return;
        }
        setSelectedChatMessages(data.messages);
      }
    );

    socket.on(
      "messageSent",
      (data: { chatId: number; message: { id: number; user: string } }) => {
        if (selectedChat !== data.chatId) {
          // TODO: Implement notification with Toasts or something
          return;
        }
        // TODO: Implement fetching a single message into frontend and backend, so I don't have to load all of the messages every single time.
      }
    );
  }, []);

  const loadChat = (id: number) => {
    if (!chats.some((chat) => chat.id === id)) {
      return;
    }
    if (selectedChat === id) {
      return;
    }
    setSelectedChat(id);
    setSelectedChatMessages([]);
    socket.emit("getChatMessages", { chadId: id });
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-surface-a0 text-white">
      <div className="h-[calc(10%)] grid grid-cols-3">
        <div />
        <h1 className="text-3xl text-primary-a0 font-bold text-center w-full">
          Draw Chat
        </h1>
        <div />
      </div>
    </div>
  );
}
