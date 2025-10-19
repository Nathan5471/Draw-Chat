import { useState, useEffect } from "react";
import { useOverlay } from "../contexts/OverlayContext";
import socket from "../socket";
import StartChat from "../components/StartChat";

export default function Home() {
  const { openOverlay, closeOverlay } = useOverlay();
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
      "chatMessages",
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

    socket.on("newChat", (data: { chat: Chat }) => {
      setChats(chats.concat([data.chat]));
    });

    socket.on("chatCreated", (data: { id: number }) => {
      closeOverlay();
      setSelectedChat(data.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleOpenStartChat = () => {
    openOverlay(<StartChat />);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-surface-a0 text-white">
      <div className="h-[calc(7%)] grid grid-cols-3 bg-surface-a1">
        <div />
        <h1 className="text-3xl text-primary-a0 font-bold text-center w-full">
          Draw Chat
        </h1>
        <div className="w-full flex">
          <button
            className="w-1/3 ml-auto bg-primary-a0 hover:bg-primary-a1 hover:scale-105 transition-all m-1 rounded-lg font-bold"
            onClick={handleOpenStartChat}
          >
            Start Chat
          </button>
        </div>
      </div>
      <div className="h-[calc(93%)] flex flex-row">
        <div className="h-full w-1/5 bg-surface-a1 flex flex-col">
          <h2 className="text-3xl text-center font-bold">Chats</h2>
          <hr className="mx-4 border-1" />
          {chats.length === 0 ? (
            <p className="text-xl text-center mt-2">No chats</p>
          ) : (
            chats.map((chat) => <div key={chat.id}></div>)
          )}
        </div>
        <div className="h-full w-4/5 flex items-center justify-center"></div>
      </div>
    </div>
  );
}
