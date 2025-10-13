import { Router } from "express";
import { signup, login } from "../controllers/authController";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post("/signup", async (req: any, res: any) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  await signup(req, res);
});

router.post("/login", async (req: any, res: any) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  await login(req, res);
});

router.get("/current", authenticate, (req: any, res: any) => {
  return res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    createdAt: req.user.createdAt,
    updateAt: req.user.updatedAt,
  });
});

export default router;
