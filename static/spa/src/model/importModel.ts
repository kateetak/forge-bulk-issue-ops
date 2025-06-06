import { ImportColumnValueType } from "src/types/ImportColumnValueType";
import { ObjectMapping } from "src/types/ObjectMapping";
import { ImportStepName, StepName } from "./BulkOperationsWorkflow";
// import { CompletionState } from "src/types/CompletionState";
// import ListenerGroup from "./ListenerGroup";
import { BulkOpsModel } from "./BulkOpsModel";
import { Project } from "src/types/Project";
import jiraDataModel from "./jiraDataModel";
import { ProjectCreateIssueMetadata } from "src/types/CreateIssueMetadata";
import { IssueType } from "src/types/IssueType";

export const MAX_ISSUES_TO_IMPORT = 1000;
const MAX_FILE_LINES_TO_READ = 1 + 1.1 * MAX_ISSUES_TO_IMPORT; // Account for the header line and allow some blank lines

export const importStepSequence: ImportStepName[] = ['file-upload', 'project-and-issue-type-selection', 'column-mapping', 'import-issues'];

class ImportModel extends BulkOpsModel<ImportStepName> {

  // private stepCompletionStateChangeListenerGroup = new ListenerGroup('ImportModel-step-completion');
  // private stepNamesToCompletionStates: Record<ImportStepName, CompletionState> = {
  //   'file-upload': 'incomplete',
  // };
  private issueCount: number = 0;
  private columnIndexesToColumnNames: any = {};
  private columnNamesToValueTypes: Record<string, ImportColumnValueType> = {};
  private selectedProject: undefined | Project = undefined;
  private selectedProjectCreateIssueMetadata: undefined | ProjectCreateIssueMetadata = undefined;
  private selectedIssueType: undefined | IssueType = undefined;
  private allMandatoryFieldsHaveColumnMappings: boolean = false;

  constructor() {
    super('ImportModel', importStepSequence);
  }

  public onFileSelection = async (file: any): Promise<void> => {
    this.setStepCompletionState('file-upload', 'incomplete');
    console.log('ImportModel.onFileSelection: onFileSelected called');
    console.log(`ImportModel.onFileSelection... selected file: ${file ? file.name : 'none'}`); 
    console.log(`ImportModel.onFileSelection: file: `, file);
    if (file) {
      const fileContent = await this.readFileContent(file);
      const fileLines = fileContent.split('\n');
      await this.setFileLines(fileLines);
    } else {
      await this.setFileLines([]);
    }
  }

  getIssueCount = (): number => {
    return this.issueCount;
  }

  setAllMandatoryFieldsHaveColumnMappings = (newAllMandatoryFieldsHaveColumnMappings: boolean): void => {
    const notify = this.allMandatoryFieldsHaveColumnMappings !== newAllMandatoryFieldsHaveColumnMappings;
    this.allMandatoryFieldsHaveColumnMappings = newAllMandatoryFieldsHaveColumnMappings;
    if (notify) {
      this.notifyStepCompletionStateChangeListeners('column-mapping', this.allMandatoryFieldsHaveColumnMappings ? 'complete' : 'incomplete');
    }
  }

  getSelectedProjectCreateIssueMetadata() {
    return this.selectedProjectCreateIssueMetadata;
  }

  public getSelectedProject = (): undefined |Project => {
    return this.selectedProject;
  }

  public setSelectedProject = async (project: undefined | Project): Promise<void> => {
    this.selectedProject = project;
    if (this.selectedProject) {
      this.selectedProjectCreateIssueMetadata = await jiraDataModel.getCreateIssueMetadataForProject(this.selectedProject.id);
    } else {
      this.selectedProjectCreateIssueMetadata = undefined;
    }
    // const stepComplete = this.selectedProject !== undefined && this.selectedProjectCreateIssueMetadata !== undefined;
    const stepComplete = this.isStepComplete();
    this.notifyStepCompletionStateChangeListeners('project-and-issue-type-selection', stepComplete ? 'complete' : 'incomplete');
  }

  getSelectedIssueType = (): undefined | IssueType => {
    return this.selectedIssueType;
  }

  setSelectedIssueType = async (issueType: undefined | IssueType): Promise<void> => {
    this.selectedIssueType = issueType;
    const stepComplete = this.isStepComplete();
    this.notifyStepCompletionStateChangeListeners('project-and-issue-type-selection', stepComplete ? 'complete' : 'incomplete');
  }

  private isStepComplete = (): boolean => {
    return this.selectedProject !== undefined && this.selectedIssueType !== undefined;
  }

  private readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        console.log('File content:', fileContent);
        resolve(fileContent as string);
      };
      reader.onerror = (e) => {
        console.error('Error reading file:', e);
        reject(e);
      };
      reader.readAsText(file);
    });
  }

  private setFileLines = async (fileLines: string[]): Promise<void> => {
    await this.startFileMapping(fileLines);
    this.setStepCompletionState('file-upload', this.issueCount > 0 ? 'complete' : 'incomplete');
  }

  public getColumnIndexesToColumnNames = (): any => {
    return this.columnIndexesToColumnNames;
  }

  public getColumnNamesToValueTypes = (): Record<string, ImportColumnValueType> => {
    return this.columnNamesToValueTypes;
  }
  
  private startFileMapping = async (fileLines: string[]): Promise<void> => {
    let columnCount = 0;
    let columnIndexesToColumnNames: any = {};
    const columnNamesToValueTypes: ObjectMapping<ImportColumnValueType> = {};
    let issueCount = 0;
    for (let lineIndex = 0; lineIndex < fileLines.length; lineIndex++) {
      const line = fileLines[lineIndex].trim();
      if (!line) {
        continue; // Skip empty lines
      }
      const columns = line.split(',');
      if (lineIndex === 0) {
        // This is the header line.
        columnCount = columns.length;
        columns.forEach((column, index) => {
          const trimmedColumn = column.trim();
          if (trimmedColumn) {
            columnIndexesToColumnNames[index] = trimmedColumn;
          }
        });
      } else {
        if (columns.length !== columnCount) {
          // KNOWN-14: Import functionality does not surface file format warnings to the user.
          console.warn(`Line ${lineIndex} has ${columns.length} columns, expected ${columnCount}. Skipping this line.`);
          continue;
        }
        issueCount++;
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
          const columnName = columnIndexesToColumnNames[columnIndex];
          if (columnName) {
            const columnValue = columns[columnIndex].trim();
            const valueType = this.interpretColumnType(columnValue);
            console.log(`Determining the type of column ${columnIndex} with name "${columnName}" in line ${lineIndex} based on the value "${columnValue}"`);
            const previouslyDeterminedType = columnNamesToValueTypes[columnName];
            if (valueType === previouslyDeterminedType || previouslyDeterminedType === undefined) {
              // All good
              columnNamesToValueTypes[columnName] = valueType;
            } else if (previouslyDeterminedType === 'unknown') {
              columnNamesToValueTypes[columnName] = valueType;
            } else {
              console.warn(`Column "${columnName}" has inconsistent types: ${previouslyDeterminedType} vs ${valueType}`);
              columnNamesToValueTypes[columnName] = 'string';
            }
            console.log(`Column ${columnIndex} with name "${columnName}" in line ${lineIndex} has type: ${valueType}`);
          } else {
            console.warn(`No column name found for index ${columnIndex} in line ${lineIndex}`);
          }
        }
      }
      if (lineIndex >= MAX_FILE_LINES_TO_READ) {
        console.warn('Too many lines, stopping processing to avoid performance issues');
        break;
      }
      if (issueCount >= MAX_ISSUES_TO_IMPORT) {
        console.warn('Too many issues, stopping processing to avoid performance issues');
        break;
      }
    }
    this.issueCount = issueCount;
    this.columnIndexesToColumnNames = columnIndexesToColumnNames;
    this.columnNamesToValueTypes = columnNamesToValueTypes;
  }

  private interpretColumnType = (columnValue: string): ImportColumnValueType => {
    // if (!isNaN(Date.parse(columnValue))) {
    //   return 'date';
    // }
    if (!isNaN(Number(columnValue))) {
      return 'number';
    }
    if (columnValue.toLowerCase() === 'true' || columnValue.toLowerCase() === 'false') {
      return 'boolean';
    }
    try {
      const parsedValue = JSON.parse(columnValue) as any;
      if (Array.isArray(parsedValue)) {
        console.warn(` * Column value "${columnValue}" is an array, which is not supported. Treating as unknown.`);
        return 'unknown';
      } else if (typeof parsedValue === 'object') {
        const isAdf =
          parsedValue.type === 'doc' && 
          typeof parsedValue.version === 'number' && 
          parsedValue.content && 
          Array.isArray(parsedValue.content);
        if (isAdf) {
          return 'rich text';
        } else {
          console.warn(` * Column value "${columnValue}" is an object, but not ADF, which is not supported. Treating as unknown.`);
          return 'unknown';
        }
      } else {
        console.log(` * Column value "${columnValue}" is a string.`);
        return 'string';
      }
    } catch (error) {
      console.warn(` * Column value "${columnValue}" could not be parsed as JSON. Treating as string.`);
      return 'string'; 
    }
  }

  // registerStepCompletionStateChangeListener = (listener: any) => {
  //   this.stepCompletionStateChangeListenerGroup.registerListener(listener);
  // };

  // unregisterStepCompletionStateChangeListener = (listener: any) => {
  //   this.stepCompletionStateChangeListenerGroup.unregisterListener(listener);
  // };

  // private notifyStepCompletionStateChangeListeners = () => {
  //   this.stepCompletionStateChangeListenerGroup.notifyListeners(undefined);
  // };

}

export default new ImportModel();
