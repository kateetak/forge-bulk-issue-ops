
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
