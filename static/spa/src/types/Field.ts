
export type FieldSchema = {
  system: string;
  type: string;
}

export type Field = {
  clauseNames: string[],
  custom: boolean,
  id: string,
  name: string,
  navigable: boolean,
  orderable: true,
  schema: FieldSchema;
  searchable: true
}

