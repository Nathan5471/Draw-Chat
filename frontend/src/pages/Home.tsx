import { useState, useEffect } from "react";
import { useOverlay } from "../contexts/OverlayContext";
import socket from "../socket";
import StartChat from "../components/StartChat";
import { IoPaperPlane } from "react-icons/io5";

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
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
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
  const [message, setMessage] = useState(Array(25).fill("white"));
  const [selectedColor, setSelectedColor] = useState<
    | "white"
    | "gray"
    | "black"
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "cyan"
    | "purple"
  >("white");

  useEffect(() => {
    socket.emit("getUserChats");

    socket.on("userChats", (data: { chats: Chat[] }) => {
      setChats(data.chats);
    });

    socket.on(
      "chatMessages",
      (data: { chatId: number; messages: Message[] }) => {
        if (data.chatId !== selectedChat?.id) {
          return;
        }
        setSelectedChatMessages(data.messages);
      }
    );

    socket.on(
      "messageSent",
      (data: { chatId: number; message: { id: number; user: string } }) => {
        if (selectedChat?.id !== data.chatId) {
          // TODO: Implement notification with Toasts or something
          return;
        }
        socket.emit("loadMessage", { messageId: data.message.id });
      }
    );

    socket.on("messageLoaded", (data: { chatId: number; message: Message }) => {
      if (selectedChat?.id !== data.chatId) {
        return;
      }
      setSelectedChatMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages.concat([data.message]);
        return newMessages;
      });
    });

    socket.on("newChat", (data: { chat: Chat }) => {
      setChats(chats.concat([data.chat]));
    });

    socket.on("chatCreated", (data: { id: number }) => {
      closeOverlay();
      const chat = chats.filter((chat) => chat.id === data.id);
      if (chat.length === 0) {
        return;
      }
      setSelectedChat(chat[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChat = (id: number) => {
    if (!chats.some((chat) => chat.id === id)) {
      return;
    }
    if (selectedChat?.id === id) {
      return;
    }
    const chat = chats.filter((chat) => chat.id === id);
    setSelectedChat(chat[0]);
    setSelectedChatMessages([]);
    socket.emit("getChatMessages", { chatId: id });
  };

  const handleOpenStartChat = () => {
    openOverlay(<StartChat />);
  };

  const handleSendMessage = () => {
    socket.emit("sendMessage", { chatId: selectedChat?.id, content: message });
    setMessage(Array(25).fill("white"));
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
        <div className="h-full w-1/5 bg-surface-a1 flex flex-col overflow-y-auto">
          <h2 className="text-3xl text-center font-bold">Chats</h2>
          <hr className="mx-4 border-1" />
          {chats.length === 0 ? (
            <p className="text-xl text-center mt-2">No chats</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`${
                  selectedChat?.id === chat.id
                    ? "bg-primary-a0 hover:bg-primary-a1"
                    : "bg-surface-a3 hover:bg-surface-a4"
                } hover:scale-105 transition-all m-2 rounded-lg p-2`}
                onClick={() => loadChat(chat.id)}
              >
                <h3 className="text-lg font-bold">
                  {`${chat.users.map((user) => user.username).join(", ")}`} (
                  {chat.unreadMessages})
                </h3>
              </div>
            ))
          )}
        </div>
        <div
          className={`h-full w-4/5 flex ${
            !selectedChat && "items-center justify-center"
          }`}
        >
          {selectedChat ? (
            <div className="w-full h-full p-2 flex flex-col">
              <h3 className="text-2xl text-center font-bold">{`${selectedChat.users
                .map((user) => user.username)
                .join(", ")}`}</h3>
              <div className="w-full mt-auto bg-surface-a1 rounded-lg m-2 p-2 flex flex-row">
                <div className="flex flex-col w-1/3">
                  <p className="text-center text-lg">Select a color</p>
                  <div className="grid grid-cols-5 gap-y-2">
                    {[
                      "white",
                      "gray",
                      "black",
                      "red",
                      "orange",
                      "yellow",
                      "green",
                      "blue",
                      "cyan",
                      "purple",
                    ].map((color) => (
                      <div
                        key={color}
                        className={`w-10 h-10 rounded hover:scale-105 transition-transform ${
                          selectedColor === color &&
                          "border-surface-a3 border-4"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setSelectedColor(
                            color as
                              | "white"
                              | "gray"
                              | "black"
                              | "red"
                              | "orange"
                              | "yellow"
                              | "green"
                              | "blue"
                              | "cyan"
                              | "purple"
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-row w-2/3 items-center justify-center">
                  <div className="grid grid-cols-5 gap-0.5">
                    {message.map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setMessage((prevMessage) => {
                            const newMessage = [...prevMessage];
                            newMessage[index] = selectedColor;
                            return newMessage;
                          });
                        }}
                      ></div>
                    ))}
                  </div>
                  <button
                    className="ml-3 p-2 bg-primary-a0 hover:bg-primary-a1 hover:scale-105 transition-all text-xl rounded-lg"
                    onClick={handleSendMessage}
                  >
                    <IoPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-2xl">Select a chat</p>
          )}
        </div>
      </div>
    </div>
  );
}
