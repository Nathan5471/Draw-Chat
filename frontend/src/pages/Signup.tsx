import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../utils/AuthAPIHandler";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signup(username, password);
      navigate("/login");
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
        onSubmit={handleSignup}
      >
        <h2 className="text-4xl font-bold text-primary-a0 text-center mb-4">
          Sign Up
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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="bg-surface-a2 hover:bg-surface-a3 hover:scale-105 transition-all p-2 rounded-lg ml-2"
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        <label htmlFor="confirmPassword" className="mb-1 text-2xl text-left">
          Confirm Password:
        </label>
        <div className="flex flex-row w-full mb-2">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="p-2 rounded-lg bg-surface-a2 text-lg w-full"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="bg-surface-a2 hover:bg-surface-a3 hover:scale-105 transition-all p-2 rounded-lg ml-2"
          >
            {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        {error && <p className="text-error-a0 text-lg mb-2">{error}</p>}
        <button
          type="submit"
          className="bg-primary-a0 hover:bg-primary-a1 hover:scale-105 transition-all font-bold p-2 rounded-lg text-lg mt-2"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
