import { IssueBulkEditField } from "src/types/IssueBulkEditFieldApiResponse";
import { ObjectMapping } from "src/types/ObjectMapping";
import ListenerGroup from "src/model/ListenerGroup";
import { Issue } from "src/types/Issue";
import jiraDataModel from "./jiraDataModel";
import moveRuleEnforcer from "src/controller/moveRuleEnforcer";

export type EditedFieldsModelIteratorCallback = (field: IssueBulkEditField, editedFieldValue: any) => void;

export type EditState = 'no-change' | 'change';
export const defaultEditState: EditState = 'no-change';

class EditedFieldsModel {

  private listenerGroup = new ListenerGroup('EditedFieldsModel');
  private sendBulkNotification: boolean = false;
  private issues: Issue[] = [];
  private fieldIdsToEditStates: ObjectMapping<EditState> = {};
  private fieldIdsToFields: ObjectMapping<IssueBulkEditField> = {};
  private fieldIdsToValues: ObjectMapping<any> = {};

  getIssues = (): Issue[] => {
    return this.issues;
  }

  getFields = (): IssueBulkEditField[] => {
    return Object.values(this.fieldIdsToFields);
  }

  getFieldIdsToValues = (): ObjectMapping<any> => {
    return this.fieldIdsToValues;
  }

  getSendBulkNotification() {
    return this.sendBulkNotification;
  }

  setFieldEditState(fieldId: string, newState: EditState): void {
    this.fieldIdsToEditStates[fieldId] = newState;
  }

  setSendBulkNotification = (sendBulkNotification: boolean): void => {
    this.sendBulkNotification = sendBulkNotification;
  }

  iterateFields = (callback: EditedFieldsModelIteratorCallback): void => {
    for (const fieldId in this.fieldIdsToFields) {
      if (this.fieldIdsToFields.hasOwnProperty(fieldId)) {
        if (this.fieldIdsToEditStates[fieldId] === 'change') {
          const field = this.fieldIdsToFields[fieldId];
          const value = this.fieldIdsToValues[fieldId];
          callback(field, value);
        }
      }
    }
  }

  setIssues = async (issues: Issue[]) => {
    console.log(`FieldEditsPanel.loadFields: Loading fields for ${issues.length} issues.`);
    const fields = await jiraDataModel.getAllIssueBulkEditFields(issues);
    // console.log(`FieldEditsPanel.loadFields: Loaded ${fields.length} fields.`);
    const filteredFields = await moveRuleEnforcer.filterEditFields(fields);
    const sortedFields = this.sortFields(filteredFields);
    this.setFields(sortedFields);
    this.issues = issues;
  }

  setFieldValue = (field: IssueBulkEditField, value: any): ObjectMapping<any> => {
    // Create a new copy of the object since this is designed to be used in a React context
    // where the state should not be mutated directly.
    const newFieldIdsToValues: ObjectMapping<any> = {
      ...this.fieldIdsToValues,
      [field.id]: value,
    };
    if (value === undefined || value === null) {
      // If the value is undefined or null, remove the field from the map.
      delete newFieldIdsToValues[field.id];
    }
    this.fieldIdsToValues = newFieldIdsToValues;

    const keys = Object.keys(this.fieldIdsToValues);
    for (const key of keys) {
      if (this.fieldIdsToValues[key] === undefined || this.fieldIdsToValues[key] === null) {
        throw new Error(`EditedFieldsModel.setFieldChange: Value for field ${key} is undefined or null.`);
      }
    }

    this.notifyListeners();
    return newFieldIdsToValues;
  }

  haveValuesBeenSpecified = (): boolean => {
    return Object.keys(this.fieldIdsToValues).length > 0;
  }

  registerListener = (listener: any) => {
    this.listenerGroup.registerListener(listener);
  };

  unregisterListener = (listener: any) => {
    this.listenerGroup.unregisterListener(listener);
  };

  private notifyListeners = () => {
    this.listenerGroup.notifyListeners(undefined);
  };

  private setFields = (fields: IssueBulkEditField[]): void => {
    const newFieldIdsToValues: ObjectMapping<any> = {};
    for (const field of fields) {
      this.fieldIdsToFields[field.id] = field;
    }
    this.fieldIdsToValues = newFieldIdsToValues;
    this.notifyListeners();
  }

  private sortFields = (fields: IssueBulkEditField[]) => {
    // Put the required firelds first since they are the most important.
    return fields.sort((a, b) => {
      const requirementComparison = a.isRequired === b.isRequired ? 0 : (a.isRequired ? -1 : 1);
      if (requirementComparison === 0) {
        const idComparison = a.id.localeCompare(b.id);
        const nameComparison = a.name.localeCompare(b.name);
        if (nameComparison === 0) {
          return idComparison;
        } else {
          return nameComparison;
        }
      } else {
        return requirementComparison;
      }
    });
  }

}

export default new EditedFieldsModel();
