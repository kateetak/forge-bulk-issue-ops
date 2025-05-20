import { Project } from "./Project"

export type ProjectSearchInfo = {
  maxResults: number; // e.g. 50,
  startAt: number; // e.g. 0,
  total: number; // e.g. 4,
  isLast: boolean; // e.g. true,
  values: Project[]
}
