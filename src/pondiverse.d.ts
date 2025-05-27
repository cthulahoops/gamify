type PondiverseCreation = {
  type: string;
  data?: string;
  image?: string;
};

export function fetchPondiverseCreation(creationId: string): Promise<Creation>;
export function getPondiverseCreationImageUrl(creation: Creation): string;
export function addPondiverseButton(
  getPondiverseCreation: () => PondiverseCreation,
): void;
