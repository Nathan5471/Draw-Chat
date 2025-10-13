import jwt from "jsonwebtoken";

const generateToken = (userId: number) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "90d" });
  return token;
};

export default generateToken;
