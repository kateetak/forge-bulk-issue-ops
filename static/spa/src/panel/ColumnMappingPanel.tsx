import React, { useEffect } from 'react';
import { WaitingMessageBuilder } from 'src/controller/WaitingMessageBuilder';
import importModel from 'src/model/importModel';
import { CompletionState } from 'src/types/CompletionState';
import { IssueTypeMetadata, ProjectCreateIssueMetadata } from 'src/types/CreateIssueMetadata';
import { FieldMetadata } from 'src/types/FieldMetadata';
import { ImportColumnValueType } from 'src/types/ImportColumnValueType';
import { ObjectMapping } from 'src/types/ObjectMapping';
import { Option } from '../types/Option';
import Select from '@atlaskit/select';
import { IssueType } from 'src/types/IssueType';

const showDebug = true;

const mandatoryIndicatorWidth = '10px';

type ColumnOptionsMatch = {
  options: Option[],
  selectedOption: undefined | Option,
  matchStrength: number
}

export type ColumnMappingPanelProps = {
  importProjectCompletionState: CompletionState,
  columnMappingCompletionState: CompletionState,
  selectedIssueType: undefined | IssueType,
  createIssueMetadata: undefined | ProjectCreateIssueMetadata
}

const ColumnMappingPanel = (props: ColumnMappingPanelProps) => {

  const [waitingMessage, setWaitingMessage] = React.useState<string>('');
  const [columnIndexesToColumnNames, setColumnIndexesToColumnNames] = React.useState<any>({});
  const [columnNamesToValueTypes, setColumnNamesToValueTypes] = React.useState<ObjectMapping<ImportColumnValueType>>({});
  const [fieldKeysToMappedColumnNames, setFieldKeysToMappedColumnNames] = React.useState<ObjectMapping<string>>({});
  const [sortedFilteredFields, setSortedFilteredFields] = React.useState<FieldMetadata[]>([]);
  const [fieldKeysToOptionMatches, setFieldKeysToOptionMatches] = React.useState<ObjectMapping<ColumnOptionsMatch>>({});

  const updateSelectionState = async (fieldKeysToMappedColumnNames: ObjectMapping<string>): Promise<void> => {
    let newAllMandatoryFieldsHaveColumnMappings = false;
    if (props.createIssueMetadata && props.selectedIssueType) {
      const issueTypeCreateMetadata = props.createIssueMetadata.issuetypes.find(issueType => {
        return issueType.id === props.selectedIssueType.id;
      });
      newAllMandatoryFieldsHaveColumnMappings = doAllMandatoryFieldsHaveColumnMappings(
        issueTypeCreateMetadata,
        fieldKeysToMappedColumnNames);
    } else {
      newAllMandatoryFieldsHaveColumnMappings = false;
    }
    importModel.setAllMandatoryFieldsHaveColumnMappings(newAllMandatoryFieldsHaveColumnMappings);
  }

  const updateState = async (): Promise<void> => {
    console.log('ColumnMappingPanel.updateState called');
    console.log(' * importProjectCompletionState:', props.importProjectCompletionState);
    console.log(' * columnMappingCompletionState:', props.columnMappingCompletionState);
    const waitingMessage = new WaitingMessageBuilder()
      .addCheck(props.importProjectCompletionState === 'complete', 'Waiting for target project selection.')
      .build();
    setWaitingMessage(waitingMessage);
    setColumnIndexesToColumnNames(importModel.getColumnIndexesToColumnNames());
    setColumnNamesToValueTypes(importModel.getColumnNamesToValueTypes());

    const fieldKeysToMappedColumnNames: ObjectMapping<string> = {};
    if (props.createIssueMetadata && props.selectedIssueType) {
      const issueTypeCreateMetadata = props.createIssueMetadata.issuetypes.find(issueType => {
        return issueType.id === props.selectedIssueType.id;
      });
      const fieldKeysToOptionMatches: ObjectMapping<ColumnOptionsMatch> = {};
      const fields = issueTypeCreateMetadata.fields;
      const filteredFields = filterFields(Object.values(fields));
      const sortedFilteredFields = sortFields(filteredFields);
      setSortedFilteredFields(sortedFilteredFields);
      for (const fieldMetadata of sortedFilteredFields) {
        const fieldType = fieldMetadata.schema?.type;
        if (fieldType) {
          if (fieldKeysToOptionMatches[fieldMetadata.key] === undefined) {
            const optionsMatch = matchColumns(fieldMetadata, fieldKeysToMappedColumnNames);
            fieldKeysToOptionMatches[fieldMetadata.key] = optionsMatch;
          }
        }
      }
      setFieldKeysToOptionMatches(fieldKeysToOptionMatches);
    } else {
      setSortedFilteredFields([]);
      setFieldKeysToOptionMatches({});
    }
    setFieldKeysToMappedColumnNames(fieldKeysToMappedColumnNames);
    await updateSelectionState(fieldKeysToMappedColumnNames);
  }

  useEffect(() => {
    console.log('ColumnMappingPanel mounted');
  }, []);

  useEffect(() => {
    updateState();
  }, [props.importProjectCompletionState, props.columnMappingCompletionState, props.selectedIssueType, props.createIssueMetadata]);

  const isFieldMandatory = (fieldMetadata: FieldMetadata): boolean => {
    return fieldMetadata.required && !fieldMetadata.hasDefaultValue;
  }

  const filterFields = (fields: FieldMetadata[]): FieldMetadata[] => {
    // KNOWN-13: No import field filtering.
    return fields.filter(field => {
      if (field.schema?.type === 'issuetype') {
        return false;
      } else if (field.schema?.type === 'project') {
        return false;
      } else if (field.schema?.type === 'issuelink') {
        return false;
      }
      return true;
    });
  }

  const sortFields = (fields: FieldMetadata[]): FieldMetadata[] => {
    return fields.sort((a, b) => {
      const aMandatory = isFieldMandatory(a);
      const bMandatory = isFieldMandatory(b);
      if (aMandatory && !bMandatory) return -1;
      if (!aMandatory && bMandatory) return 1;
      return 0;
    });
  }

  const doAllMandatoryFieldsHaveColumnMappings = (
    issueTypeCreateMetadata: IssueTypeMetadata,
    fieldKeysToMappedColumnNames: ObjectMapping<string>
  ): boolean => {
    console.log('doAllMandatoryFieldsHaveColumnMappings called');
    if (!issueTypeCreateMetadata) {
      return false;
    }
    let fieldCount = 0;
    const fields = issueTypeCreateMetadata.fields;
    const filteredFields  = filterFields(Object.values(fields));
    for (const fieldMetadata of filteredFields) {
      fieldCount++;
      if (isFieldMandatory(fieldMetadata)) {
        const columnName = fieldKeysToMappedColumnNames[fieldMetadata.key];
        if (!columnName || columnName.trim() === '') {
          console.warn(`Mandatory field "${fieldMetadata.name}" does not have a column mapping.`);
          return false;
        }
      }
    }
    return fieldCount > 0;
  }

  const matchColumns = (fieldMetadata: FieldMetadata, fieldKeysToMappedColumnNames: ObjectMapping<string>): ColumnOptionsMatch => {
    // const ieldKeysToMappedColumnNames: ObjectMapping<string> = {};
    const columnOptions: Option[] = [];
    let selectedOption: undefined | Option = undefined;
    let matchStrength = 0;
    const columnNamesToValueTypes = importModel.getColumnNamesToValueTypes();
    const columnNames = Object.keys(columnNamesToValueTypes);
    let matchedColumnName: undefined | string = undefined;
    for (const columnName of columnNames) {
      const columnValueType = columnNamesToValueTypes[columnName];
      let matchTypeFactor = 0;
      if (columnValueType === fieldMetadata.schema?.type) {
        matchTypeFactor = 1; // Exact type match
      } else if (columnValueType === 'string' && fieldMetadata.schema?.type === 'option') {
        matchTypeFactor = 0.8; // Text is a string, but not vice versa
      } else {
        matchTypeFactor = 0.2; // No type match
      }

      let thisMatchStrength = 0;
      const option: Option = {
        label: columnName,
        value: columnName,
      }
      columnOptions.push(option);
      if (columnName.toLowerCase() === fieldMetadata.name.toLowerCase()) {
        selectedOption = option; // Prefer exact match
        thisMatchStrength = 1; // Exact match
      } else if (columnName.toLowerCase().includes(fieldMetadata.name.toLowerCase())) {
        thisMatchStrength = 0.5; // Partial match
      } else if (fieldMetadata.name.toLowerCase().includes(columnName.toLowerCase())) {
        thisMatchStrength = 0.5; // Partial match
      }
      thisMatchStrength *= matchTypeFactor; // Apply type match factor
      if (thisMatchStrength > matchStrength) {
        matchStrength = thisMatchStrength;
        selectedOption = option; // Prefer exact match
        fieldKeysToMappedColumnNames[fieldMetadata.key] = columnName; // Store the mapping
        matchedColumnName = columnName; // Store the matched column name
        // console.log(`* Matching column "${columnName}" with field "${fieldMetadata.name}". Match strength: ${thisMatchStrength}.`);
        // console.log(`* fieldKeysToMappedColumnNames = ${JSON.stringify(fieldKeysToMappedColumnNames, null, 2)}`);
      }
    }
    return {
      options: columnOptions,
      selectedOption: selectedOption,
      matchStrength: matchStrength
    };
  }

  const onColumnSelect = async (fieldMetadata: FieldMetadata, selectedOption: undefined | Option): Promise<void> => {
    // console.log(`ColumnMappingPanel.onColumnSelect: selectedOption = `, selectedOption);
    const newFieldKeysToMappedColumnNames = { ...fieldKeysToMappedColumnNames };
    if (selectedOption) {
      const columnName = selectedOption ? selectedOption.value : '';
      newFieldKeysToMappedColumnNames[fieldMetadata.key] = columnName;
    } else {
      delete newFieldKeysToMappedColumnNames[fieldMetadata.key];
    }
    setFieldKeysToMappedColumnNames(newFieldKeysToMappedColumnNames);
    await updateSelectionState(newFieldKeysToMappedColumnNames);
  }

  const renderMandatoryIndicator = (fieldMetadata: FieldMetadata) => {
    const text = isFieldMandatory(fieldMetadata) ? '*' : '';
    return <div style={{ display: 'inline-block', width: mandatoryIndicatorWidth, color: '#BF2600' }}>{text}</div>;
  }

  const renderColumnSelection = (fieldMetadata: FieldMetadata) => {
    const fieldType = fieldMetadata.schema?.type;
    if (fieldType) {
      const optionsMatch = fieldKeysToOptionMatches[fieldMetadata.key];
      const columnOptions = optionsMatch.options;
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {renderMandatoryIndicator(fieldMetadata)}
          <Select<Option>
            options={columnOptions}
            value={optionsMatch.selectedOption}
            isRequired={fieldMetadata.required}
            isClearable={!isFieldMandatory(fieldMetadata)}
            placeholder="Select a column"
            onChange={selectedOption => onColumnSelect(fieldMetadata, selectedOption)}
          />
        </div>
      );
    } else {
      return (
        <div>
          <p>Unspecified field type</p>
        </div>
      );
    }
  }

  const renderColumnMappingTable = (createIssueMetadata: ProjectCreateIssueMetadata, issueTypeCreateMetadata: IssueTypeMetadata) => {
    const renderedRows: any[] = [];
    // const fields = issueTypeCreateMetadata.fields;
    // const filteredFields = filterFields(Object.values(fields));
    // const sortedFields = sortFields(filteredFields);


    for (const fieldMetadata of sortedFilteredFields) {
      const fieldType = fieldMetadata.schema?.type || 'unknown';
      renderedRows.push(
        <tr key={`issue-type-field-${fieldMetadata.key}`}>
          <td>{fieldMetadata.name}</td>
          <td>{fieldType}</td>
          <td>{renderColumnSelection(fieldMetadata)}</td>
        </tr>
      );
    }
    return (
      <div style={{margin: '20px 0px'}}>
        <table>
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Data type</th>
              <th>File column</th>
            </tr>
          </thead>
          <tbody>
            {renderedRows}
          </tbody>
        </table>
      </div>
    );
  }

  const renderColumnMapping = () => {
    const createIssueMetadata = importModel.getSelectedProjectCreateIssueMetadata();
    const selectedIssueType = importModel.getSelectedIssueType();
    if (!createIssueMetadata || !selectedIssueType) {
      return null;
    }
    const issueTypeCreateMetadata = createIssueMetadata.issuetypes.find(issueType => issueType.id === selectedIssueType.id);
    if (!issueTypeCreateMetadata) {
      return (
        <div style={{margin: '20px 0px'}}>  
          <p>Selected issue type not found in project create issue metadata.</p>
        </div>
      );
    }
    return renderColumnMappingTable(createIssueMetadata, issueTypeCreateMetadata);
  }

  const renderCompletionState = () => {
    return (
      <div>
        <p>{waitingMessage}</p>
      </div>
    );
  };

  const renderDebug = () => {
    console.log('ColumnMappingPanel.renderDebug: fieldKeysToMappedColumnNames = ', fieldKeysToMappedColumnNames);
    return (
      <div style={{margin: '20px 0px'}}>
        <h3>Debug Information</h3>
        <div>
          <strong>fieldKeysToMappedColumnNames:</strong>
          <pre>{JSON.stringify(fieldKeysToMappedColumnNames, null, 2)}</pre>
        </div>
        <div>
          <strong>Create issue metadata:</strong>
          <pre>{JSON.stringify(importModel.getSelectedProjectCreateIssueMetadata(), null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderCompletionState()}
      {waitingMessage ? null : renderColumnMapping()}
      {showDebug ? renderDebug() : null}
    </div>
  )

}

export default ColumnMappingPanel;
