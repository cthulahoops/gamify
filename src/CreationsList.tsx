import { useState, useEffect } from "react";
import { fetchPondiverseCreations } from "./pondiverse";
import type { PondiverseCreation } from "./pondiverse";

export function CreationsList() {
  const [creations, setCreations] = useState<PondiverseCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCreations() {
      try {
        const data = await fetchPondiverseCreations();
        setCreations(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load creations",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCreations();
  }, []);

  if (loading) return <div>Loading creations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="creations-list">
      <h2>Available Creations</h2>
      <ul className="creations-grid">
        {creations.map((creation) => (
          <li key={creation.id} className="creation-item">
            <a href={`?creation=${creation.id}`}>
              <div className="creation-title">{creation.title}</div>
              <div className="creation-type">Type: {creation.type}</div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
