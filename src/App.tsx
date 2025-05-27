import "./App.css";
import "./style.css";

import { useMemo, useState, useCallback } from "react";
import { Game } from "./Game";
import { CreationsList } from "./CreationsList";

function useCreationUrl() {
  return useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("creation");
  }, []);
}

function ImageUpload({
  onImageLoad,
}: {
  onImageLoad: (img: HTMLImageElement) => void;
}) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => onImageLoad(img);
        img.src = URL.createObjectURL(file);
      }
    },
    [onImageLoad],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => onImageLoad(img);
        img.src = URL.createObjectURL(file);
      }
    },
    [onImageLoad],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: "2px dashed #ccc",
        padding: "20px",
        textAlign: "center",
        margin: "20px 0",
      }}
    >
      <p>Drop an image here or:</p>
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}

export default function App() {
  const creationUrl = useCreationUrl();
  const [localImage, setLocalImage] = useState<HTMLImageElement | null>(null);

  if (localImage) {
    return <Game localImage={localImage} />;
  }

  if (creationUrl) {
    return <Game creationUrl={creationUrl} />;
  }

  return (
    <div>
      <h1>Pondiverse Game</h1>
      <p>
        Add <code>?creation=YOUR_ID</code> to the URL to play on a Pondiverse
        grid, or upload an image below:
      </p>
      <ImageUpload onImageLoad={setLocalImage} />
      <CreationsList />
    </div>
  );
}
