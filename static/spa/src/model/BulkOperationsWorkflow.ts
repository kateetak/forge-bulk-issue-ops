

export type MoveStepName = 'filter' | 'issue-selection' | 'target-project-selection' | 'issue-type-mapping' | 'field-mapping' |                 'move-or-edit';
export type EditStepName = 'filter' | 'issue-selection' |                                                                       'edit-fields' | 'move-or-edit';
export type ImportStepName = 'file-upload' | 'project-and-issue-type-selection' | 'column-mapping' | 'import-issues';
export type StepName = MoveStepName | EditStepName | ImportStepName;
