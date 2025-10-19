import { useState, useEffect } from "react";
import socket from "../socket";
import { useOverlay } from "../contexts/OverlayContext";

export default function StartChat() {
  const { closeOverlay } = useOverlay();
  const [otherUser, setOtherUser] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    socket.on("chatStartingError", (errorMessage: string) => {
      setError(errorMessage);
    });
  }, []);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit("startChat", { username: otherUser });
  };

  return (
    <form onSubmit={handleStartChat} className="flex flex-col w-60">
      <h1 className="text-3xl text-center text-primary-a0 font-bold">
        Start Chat
      </h1>
      <label htmlFor="otherUser" className="text-left text-xl">
        Other User:
      </label>
      <input
        type="text"
        id="otherUser"
        name="otherUser"
        value={otherUser}
        onChange={(e) => setOtherUser(e.target.value)}
        required
        className="mb-2 p-2 rounded-lg bg-surface-a2 text-lg"
        placeholder="Their username"
      />
      {error && <p className="text-lg text-error-a0 mb-2">{error}</p>}
      <div className="flex flex-row w-full">
        <button
          type="submit"
          className="bg-primary-a0 hover:bg-primary-a1 hover:scale-105 transition-all font-bold p-2 rounded-lg text-lg w-full"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => closeOverlay()}
          className="bg-surface-a2 hover:bg-surface-a3 hover:scale-105 transition-all font-bold p-2 rounded-lg text-lg w-full ml-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
