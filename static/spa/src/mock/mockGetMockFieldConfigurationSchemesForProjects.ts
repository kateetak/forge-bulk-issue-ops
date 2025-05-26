import { PageResponse } from "src/types/PageResponse";
import { ProjectCustomFieldContextMappings } from "src/types/ProjectCustomFieldContextMappings";
import { ProjectsFieldConfigurationSchemeMapping } from "src/types/ProjectsFieldConfigurationSchemeMapping";

export const getMockFieldConfigurationSchemesForProjects = async (
  projectIds: string[],
  startAt: number = 0,
  maxResults: number = 50
// ): Promise<PageResponse<ProjectCustomFieldContextMappings>> => {
): Promise<PageResponse<ProjectsFieldConfigurationSchemeMapping>> => {
  const items: ProjectsFieldConfigurationSchemeMapping[] = [];
  
  // The following will test the pagination logic
  const returnWholePage = startAt > 0;
  const itemsToCreate = 2;


  for (let index = 0; index < itemsToCreate; index++) {
    const absoluteIndex = startAt + index;
    const item: ProjectsFieldConfigurationSchemeMapping = {
      projectIds: projectIds.map((projectId) => projectId),
      fieldConfigurationScheme: {
        id: `mock-field-config-scheme-${absoluteIndex}`,
        name: `Mock field configuration ${absoluteIndex}`,
        description: `Description for mock field configuration ${absoluteIndex}`
      }
    }
    items.push(item);
  }

  const response: PageResponse<ProjectsFieldConfigurationSchemeMapping> = {
    isLast: returnWholePage,
    maxResults: itemsToCreate,
    startAt: startAt,
    total: maxResults + itemsToCreate,
    values: items
  }
  return response;

}
