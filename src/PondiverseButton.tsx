import { useEffect, useRef, useState } from "react";

import "./pondiverse.css";

export type PondiverseStore = {
  name: string;
  home: string;
  addCreation: string;
  getCreation: string;
  getCreationImage: string;
  getCreations: string;
  deleteCreation: string;
};

export type PondiverseCreation = {
  type?: string;
  data?: string;
  image?: string;
  title?: string;
};

// constants.ts
const DEFAULT_STORE: PondiverseStore = {
  name: "todepondiverse",
  home: "https://pondiverse.com/",
  addCreation: "https://pondiverse.val.run/add-creation",
  getCreation: "https://pondiverse.val.run/get-creation?id=",
  getCreationImage: "https://pondiverse.val.run/get-creation-image?id=",
  getCreations: "https://pondiverse.val.run/get-creations",
  deleteCreation: "https://pondiverse.val.run/delete-creation",
};

interface PondiverseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
  previewImage?: string;
}

export function PondiverseDialog({
  isOpen,
  onClose,
  onSubmit,
  previewImage,
}: PondiverseDialogProps) {
  const [title, setTitle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      await onSubmit(title);
      setTitle("");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} className="pondiverse-dialog">
      <form onSubmit={handleSubmit}>
        <p>
          Do you want to share your creation to the{" "}
          <a
            href="https://pondiverse.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            pondiverse
          </a>
          ?
        </p>
        <p>All creations get deleted after 25 hours.</p>

        {previewImage && <img src={previewImage} alt="Creation preview" />}

        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoComplete="off"
          spellCheck="false"
        />

        <div>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

// PondiverseButton.tsx
interface PondiverseButtonProps {
  getPondiverseCreation: () => PondiverseCreation;
  store?: PondiverseStore;
}

export function PondiverseButton({
  getPondiverseCreation,
  store = DEFAULT_STORE,
}: PondiverseButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePublish = async (title: string) => {
    const creation = getPondiverseCreation();

    const request = {
      title,
      data: creation.data || "",
      type: creation.type || "",
      image: creation.image || "",
    };

    const response = await fetch(store.addCreation, {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="pondiverse-button-container">
        <button
          className="pondiverse-button"
          onClick={() => setIsDialogOpen(true)}
        >
          ✶
        </button>
      </div>

      <PondiverseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handlePublish}
        previewImage={getPondiverseCreation().image}
      />
    </>
  );
}
