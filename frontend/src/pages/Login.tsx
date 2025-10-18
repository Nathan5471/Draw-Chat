import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../utils/AuthAPIHandler";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-surface-a0 text-white p-4">
      <form
        className="flex flex-col w-80 p-6 rounded-lg bg-surface-a1"
        onSubmit={handleLogin}
      >
        <h2 className="text-4xl font-bold text-primary-a0 text-center mb-4">
          Login
        </h2>
        <label htmlFor="username" className="mb-1 text-2xl text-left">
          Username:
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mb-2 p-2 rounded-lg bg-surface-a2 text-lg"
          placeholder="Enter your username"
        />
        <label htmlFor="password" className="mb-1 text-2xl text-left">
          Password:
        </label>
        <div className="flex flex-row w-full mb-2">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 rounded-lg bg-surface-a2 text-lg w-full"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="bg-surface-a2 hover:bg-surface-a3 hover:scale-105 transition-all p-2 rounded-lg ml-2"
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        {error && <p className="text-error-a0 text-lg mb-2">{error}</p>}
        <button
          type="submit"
          className="bg-primary-a0 hover:bg-primary-a1 hover:scale-105 transition-all font-bold p-2 rounded-lg text-lg mt-2"
        >
          Login
        </button>
        <p className="text-lg mt-2">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary-a0 hover:underline">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}
