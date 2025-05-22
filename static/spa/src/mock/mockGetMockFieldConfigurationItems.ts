import { start } from "repl";
import { FieldConfigurationItem } from "src/types/FieldConfigurationItem";
import { FieldConfigurationItemsResponse } from "src/types/FieldConfigurationItemsResponse";

export const getMockFieldConfigurationItems = async (
  fieldConfigurationId: string,
  startAt: number = 0,
  maxResults: number = 50
): Promise<FieldConfigurationItemsResponse> => {
  const items: FieldConfigurationItem[] = [];


  // The following will test the pagination logic
  const returnWholePage = startAt > 0;
  const itemsToCreate = 2;


  for (let index = 0; index < itemsToCreate; index++) {
    const absoluteIndex = startAt + index;
    const id = `${fieldConfigurationId}-${index}`;
    const item: FieldConfigurationItem = {
      id: `${fieldConfigurationId}-${absoluteIndex}`,
      isHidden: Math.random() < 0.5,
      isRequired: Math.random() < 0.5,
      description: `Mock field configuration item ${absoluteIndex}`,
    }
    items.push(item);
  }

  const response: FieldConfigurationItemsResponse = {
    isLast: returnWholePage,
    maxResults: itemsToCreate,
    startAt: startAt,
    total: maxResults + itemsToCreate,
    values: items
  }
  return response;
}
