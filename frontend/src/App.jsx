import { useState, useEffect } from "react";

function App() {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8080/api/health")
      .then((response) => response.json())
      .then((json) => setHealth(json["status"]))
      .catch((error) => setError(error.message));
  }, []);

  const createRoom = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://127.0.0.1:8080/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ host_client_id: "dev-host" }),
      });
      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      } else {
        setError(`HTTP ${response.status}`);
        setRoom(null);
      }
    } catch (err) {
      setError(err.message);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">CodeRoom</h1>
      {health && <p className="my-2">Backend status: {health}</p>}
      <button
        onClick={createRoom}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-500 active:bg-blue-700"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>

      {error && <p className="text-red-500">Error: {error}</p>}

      {room && (
        <p className="mt-4 text-lg">
          Room:{" "}
          <span className="font-mono uppercase tracking-widest">{room.id}</span>
        </p>
      )}
    </div>
  );
}

export default App;
