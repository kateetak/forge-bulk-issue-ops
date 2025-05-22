import { ProjectsFieldConfigurationSchemeMappingObject, ProjectsFieldConfigurationSchemeMappings } from "src/types/ProjectsFieldConfigurationSchemeMappings";

export const getMockFieldConfigurationSchemesForProjects = async (
  projectIds: string[],
  startAt: number = 0,
  maxResults: number = 50
): Promise<ProjectsFieldConfigurationSchemeMappings> => {
  const items: ProjectsFieldConfigurationSchemeMappingObject[] = [];
  
  // The following will test the pagination logic
  const returnWholePage = startAt > 0;
  const itemsToCreate = 2;


  for (let index = 0; index < itemsToCreate; index++) {
    const absoluteIndex = startAt + index;
    const item: ProjectsFieldConfigurationSchemeMappingObject = {
      projectIds: projectIds.map((projectId) => parseInt(projectId)),
      fieldConfigurationScheme: {
        id: `mock-field-config-scheme-${absoluteIndex}`,
        name: `Mock field configuration ${absoluteIndex}`,
        description: `Description for mock field configuration ${absoluteIndex}`
      }
    }
    items.push(item);
  }

  const response: ProjectsFieldConfigurationSchemeMappings = {
    isLast: returnWholePage,
    maxResults: itemsToCreate,
    startAt: startAt,
    total: maxResults + itemsToCreate,
    values: items
  }
  return response;

}
