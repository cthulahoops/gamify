import { useState, useEffect } from "react";
// https://gamify.cthulahoops.org/?creation=https://pondiverse.val.run/get-creation?id=532
import {
  fetchPondiverseCreation,
  getPondiverseCreationImageUrl,
} from "./pondiverse";

import type { PondiverseCreation } from "./pondiverse";

export type Creation = PondiverseCreation & { img?: HTMLImageElement };

export function usePondiverse(creationId: string) {
  const [creation, setCreation] = useState<Creation | null>(null);

  useEffect(() => {
    async function fetchCreation() {
      try {
        const data = await fetchPondiverseCreation(creationId);
        let img = null;
        if (data.type === "gamified") {
          setCreation({ ...data, type: "gamified" });
        } else {
          const imageUrl = getPondiverseCreationImageUrl(data);
          img = await setImageFromUrl(imageUrl);
          setCreation({ ...data, img });
        }
      } catch (error) {
        console.error("Error fetching creation:", error);
      }
    }

    if (creationId) {
      fetchCreation();
    }
  }, [creationId]);

  return { creation };
}

function setImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = url;
  });
}
