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
      // TODO:
      // 1. setLoading(true), clear error, clear room
      setLoading(true);
      setError(null);
      setRoom(null);

      // 2. POST to http://127.0.0.1:8080/api/rooms
      //    - headers: { "Content-Type": "application/json" }
      //    - body: JSON.stringify({ host_client_id: <some client id> })
      //    - For now, hardcode host_client_id: "dev-host" — we'll do localStorage in Phase 2.
      //      Note the TODO in DEVLOG: real client ID comes next phase.

      const response = await fetch("http://127.0.0.1:8080/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ host_client_id: "dev-host" }),
      });

      // 3. If response.ok: parse json, setRoom(data)
      // 4. If not ok: setError(`HTTP ${response.status}`)

      if (response.ok) {
        data = await response.json();
        setRoom(data);
      } else {
        setError(`HTTP ${response.status}`);
      }
      // 5. catch network errors -> setError(err.message)
    } catch (err) {
      setError(err.message);
      // 6. finally: setLoading(false)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">CodeRoom</h1>
      {health && <p>Backend status: {health}</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <button
        onClick={createRoom}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-500 active:bg-blue-700"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>

      {/* TODO: three render branches:
          - error: red <p>
          - room: show "Room: <id>" — use room.id, styled
          - neither: nothing
      */}
    </div>
  );
}

export default App;
