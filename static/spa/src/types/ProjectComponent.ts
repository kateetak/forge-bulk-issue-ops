
export type ProjectComponent = {
  id: string;
  name: string;
  description: string;
  lead?: {
    accountId: string;
    displayName?: string;
  }
  project?: string;
  projectId?: string;

  // More fields available
}
