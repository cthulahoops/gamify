type PondiverseCreation = {
  id: string;
  type: string;
  title: string;
  data?: string;
  image?: string;
};

export function fetchPondiverseCreation(creationId: string): Promise<PondiverseCreation>;
export function fetchPondiverseCreations(): Promise<PondiverseCreation[]>;
export function getPondiverseCreationImageUrl(creation: PondiverseCreation): string;
export function addPondiverseButton(
  getPondiverseCreation: () => PondiverseCreation,
): void;
