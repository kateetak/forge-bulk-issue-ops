
export interface Project {
  id: string; // e.g. "10000",
  key: string; // e.g. "FEAT",
  name: string; // e.g. "Features",
  projectTypeKey: string; // e.g. "software",
  simplified: boolean; // e.g. false,
  style: string; // e.g. "classic",
  isPrivate: boolean; // e.g. false,
  properties: any
}