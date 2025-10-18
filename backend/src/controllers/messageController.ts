import prisma from "../prisma/client";
import { User } from "@prisma/client";

export const getChatData = async (user: User, chatId: number) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: true,
        messages: {
          include: { user: true, readBy: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (!chat.users.some((chatUser) => chatUser.id === user.id)) {
      throw new Error("User is not a part of this chat");
    }
    let unreadMessages = 0;
    chat.messages.forEach((message) => {
      if (!message.readBy.some((readUser) => readUser.id === user.id)) {
        unreadMessages += 1;
      }
    });
    return {
      id: chat.id,
      users: chat.users.map((chatUser) => ({
        id: chatUser.id,
        username: chatUser.username,
      })),
      unreadMessages,
    };
  } catch (error) {
    console.error("Error fetching chat data:", error);
    throw new Error("Failed to fetch chat data");
  }
};

export const getUserChats = async (user: User) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { users: { some: { id: user.id } } },
    });
    const chatData = await Promise.all(
      chats.map(async (chat) => {
        const data = await getChatData(user, chat.id);
        return data;
      })
    );
    return chatData;
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw new Error("Failed to fetch user chats");
  }
};

export const getChatMessages = async (user: User, chatId: number) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: true,
        messages: {
          include: { user: true, readBy: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (!chat.users.some((chatUser) => chatUser.id === user.id)) {
      throw new Error("User is not a part of this chat");
    }
    await Promise.all(
      chat.messages.map(async (message) => {
        if (!message.readBy.some((readUser) => readUser.id === user.id)) {
          await prisma.message.update({
            where: { id: message.id },
            data: { readBy: { connect: { id: user.id } } },
          });
        }
      })
    );
    return chat.messages.map((message) => ({
      id: message.id,
      content: message.content,
      user: { id: message.user.id, username: message.user.username },
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw new Error("Failed to fetch chat messages");
  }
};

export const sendMessage = async (
  user: User,
  chatId: number,
  content: string
) => {
  // TODO: I need to implement validating the content
  // I'm not too sure what that exactly how the data will look, but it will be a 5x5 grid of colors
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { users: true },
    });
    if (!chat) {
      throw new Error("Chat not found");
    }
    if (!chat.users.some((chatUser) => chatUser.id === user.id)) {
      throw new Error("User is not a part of this chat");
    }
    const message = await prisma.message.create({
      data: {
        content,
        user: { connect: { id: user.id } },
        chat: { connect: { id: chatId } },
      },
    });
    return { id: message.id, user: user.username };
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

export const createChat = async (user: User, otherUsername: string) => {
  try {
    const otherUser = await prisma.user.findUnique({
      where: { username: otherUsername },
    });
    if (!otherUser) {
      throw new Error("Other user doesn't exist");
    }
    const createdChat = await prisma.chat.create({
      data: {
        users: { connect: [{ id: user.id }, { id: otherUser.id }] },
      },
    });
    const chat = await prisma.chat.findUnique({
      where: { id: createdChat.id },
      include: { users: true },
    });
    if (!chat) {
      throw new Error("Chat not found (somehow)");
    }
    const chatData = await getChatData(user, chat.id);
    return chatData;
  } catch (error) {
    console.error("Failed to create chat:");
    throw new Error("Failed to create chat");
  }
};
