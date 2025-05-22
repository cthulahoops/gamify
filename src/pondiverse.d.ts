type PondiverseCreation = {
  type: string;
  data: string;
};

export function fetchPondiverseCreation(creationId: string): Promise<Creation>;
export function getPondiverseCreationImageUrl(creation: Creation): string;
