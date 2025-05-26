import react from 'react';
import Lozenge from '@atlaskit/lozenge';
import { TaskStatus } from '../types/TaskOutcome';

export type TaskStatusLozengeProps = {
  status: TaskStatus;
}

export const TaskStatusLozenge = (props: TaskStatusLozengeProps) => {

  const statusAppearance = 
    props.status === 'ENQUEUED' ? 'new' :
    props.status === 'COMPLETE' ? 'success' :
    props.status === 'RUNNING' ? 'inprogress' :
   'removed';

  return (
    <Lozenge appearance={statusAppearance}>{props.status}</Lozenge>
  );

}