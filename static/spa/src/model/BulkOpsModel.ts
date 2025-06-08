import { ImportStepName, StepName } from "./BulkOperationsWorkflow";
import { CompletionState } from "src/types/CompletionState";
import ListenerGroup from "./ListenerGroup";
import { debounce } from "./util";

export const importStepSequence: ImportStepName[] = ['file-upload'];

export type CompletionStateChangeInfo = {
  stepName: StepName;
  completionState: CompletionState;
  modelUpdateTimestamp: number;
}

// These two constants will result in a delay before the model update listeners are notified, but with
// the benefit that it avoids unnecessary updates when multiple changes occur in quick succession.
const modelUpdateNotifierDebouncePeriodMilliseconds = 100;
const immediatelyNotifyModelUpdateListeners = false;

export class BulkOpsModel<StepNameSubtype extends StepName> {

  private stepSequence: StepNameSubtype[];
  private stepNamesToCompletionStates: Record<StepNameSubtype, CompletionState>;
  private lastUpdateTimestamp: number = 0;
  private stepCompletionStateChangeListenerGroup: ListenerGroup;
  private modelUpdateChangeListenerGroup: ListenerGroup;
  private debouncedNotifyModelUpdateChangeListeners: () => void;

  constructor(modelName: string, stepSequence: StepNameSubtype[]) {
    this.stepSequence = stepSequence;
    this.stepCompletionStateChangeListenerGroup = new ListenerGroup(`${modelName}-step-completion`);
    this.modelUpdateChangeListenerGroup = new ListenerGroup(`${modelName}-model-update`);
    this.stepNamesToCompletionStates = {} as Record<StepNameSubtype, CompletionState>;
    stepSequence.forEach((stepName) => {
      this.stepNamesToCompletionStates[stepName] = 'incomplete';
    });

    this.debouncedNotifyModelUpdateChangeListeners = debounce(
      this.notifyModelUpdateChangeListeners,
      modelUpdateNotifierDebouncePeriodMilliseconds,
      immediatelyNotifyModelUpdateListeners
    );
  }

  public getStepSequence = (): StepNameSubtype[] => {
    return this.stepSequence;
  }

  public updateModelTimestamp = (): void => {
    const now = Date.now();
    const updated = now !== this.lastUpdateTimestamp;
    this.lastUpdateTimestamp = now;
    if (updated) {
      // console.log(`Detected model update - enqueuing model update notification...`);
      this.debouncedNotifyModelUpdateChangeListeners();
    }
  }

  public getUpdateTimestamp = (): number => {
    return this.lastUpdateTimestamp;
  }

  public setStepCompletionState = (stepName: StepNameSubtype, completionState: CompletionState): void => {
    if (this.stepNamesToCompletionStates[stepName] !== completionState) {
      this.updateModelTimestamp();
    }
    this.stepNamesToCompletionStates[stepName] = completionState;
    console.log(`Step "${stepName}" completion state changed to "${completionState}"`);
    this.notifyStepCompletionStateChangeListeners(stepName, completionState);
  }

  public registerStepCompletionStateChangeListener = (listener: any) => {
    this.stepCompletionStateChangeListenerGroup.registerListener(listener);
  };

  public unregisterStepCompletionStateChangeListener = (listener: any) => {
    this.stepCompletionStateChangeListenerGroup.unregisterListener(listener);
  };

  protected notifyStepCompletionStateChangeListeners = (stepName: StepName, completionState: CompletionState) => {
    const completionStateChangeInfo: CompletionStateChangeInfo = {
      stepName: stepName,
      completionState: completionState,
      modelUpdateTimestamp: this.lastUpdateTimestamp,
    }
    this.stepCompletionStateChangeListenerGroup.notifyListeners(completionStateChangeInfo);
  };

  public registerModelUpdateChangeListener = (listener: any) => {
    this.modelUpdateChangeListenerGroup.registerListener(listener);
  };

  public unregisterModelUpdateChangeListener = (listener: any) => {
    this.modelUpdateChangeListenerGroup.unregisterListener(listener);
  };

  private notifyModelUpdateChangeListeners = () => {
    // console.log(`Detected model update - firing model update notifications...`);
    this.modelUpdateChangeListenerGroup.notifyListeners(this.lastUpdateTimestamp);
  }

}
