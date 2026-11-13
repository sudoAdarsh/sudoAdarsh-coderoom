import { useState, useEffect } from "react";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8080/api/health")
      .then((response) => response.json())
      .then((json) => setHealth(json["status"]))
      .catch((error) => setError(error.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CodeRoom</h1>
      {error && <p className="text-red-500">Error: {error}</p>}
      {health && <p>Backend status: {health}</p>}
    </div>
  );
}

export default App;
