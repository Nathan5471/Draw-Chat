import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken";

export const signup = async (req: any, res: any) => {
  const { username, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { username, password: hashedPassword },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Failed to signup" });
  }
};

export const login = async (req: any, res: any) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Failed to login" });
  }
};

export const checkUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error("Failed to check username");
  }
};
