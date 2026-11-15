import { useState, useEffect, useRef } from "react";

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

  const wsRef = useRef(null);

  const connectWs = () => {
    if (!room) return;
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`ws://127.0.0.1:8080/ws/${room.id}`);
    ws.onopen = () => {
      console.log("ws open");
      ws.send(
        JSON.stringify({
          type: "echo",
          payload: {
            text: "hello",
          },
        }),
      );

      ws.send(
        JSON.stringify({
          type: "ping",
          payload: {},
        }),
      );
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      switch (msg.type) {
        case "echo":
          console.log("echo: ", msg.payload.text);
          break;
        case "pong":
          console.log("pong at: ", msg.payload.at);
          break;
        case "error":
          console.log("server error: ", msg.payload.message);
          break;
        default:
          console.warn("Unkown message type: ", msg.type);
      }
    };
    ws.onerror = (e) => {
      console.log("ws error: ", e);
    };
    ws.onclose = () => {
      console.log("ws closed");
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">CodeRoom</h1>
      {health && <p className="mt-2">Backend status: {health}</p>}
      <button
        onClick={createRoom}
        disabled={loading}
        className="bg-blue-600 text-white mt-2 px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-500 active:bg-blue-700"
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
      {room && (
        <button
          className="block p-2 bg-blue-600 border border-blue-800 rounded text-white mt-2 hover:bg-blue-500 active:bg-blue-700"
          onClick={connectWs}
        >
          Connect
        </button>
      )}
    </div>
  );
}

export default App;
