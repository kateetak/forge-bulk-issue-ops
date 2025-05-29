
export class WaitingMessageBuilder {

  waitingMessage: string = '';

  addCheck = (condition: boolean, message: string): WaitingMessageBuilder => {
    const separator = this.waitingMessage ? ' ' : '';
    if (!condition) {
      this.waitingMessage += `${separator}${message}`;
    }
    return this;
  }

  build = (): string => {
    return this.waitingMessage;
  }

}

// const waitingMessage = new WaitingMessageBuilder()
//       .addCondition(!allDefaultValuesProvided, 'All field values are not yet provided')
//       .addCondition(!isFieldMappingsComplete(), 'Field value mapping is not yet complete')
//       .addCondition(!selectedToProject || !selectedToProject.id, 'Target project is not selected')
//       .addCondition(selectedIssues.length === 0, 'No issues selected');