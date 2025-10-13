import prisma from "../prisma/client";
import jwt from "jsonwebtoken";

const authenticate = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      res.clearCookie("token");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authenticate;
