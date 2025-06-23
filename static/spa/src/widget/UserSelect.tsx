import React, { useEffect, useState, useRef } from 'react';
import { Label } from '@atlaskit/form';
import Select from '@atlaskit/select';
import { Option } from '../types/Option'
import jiraDataModel from '../model/jiraDataModel';
import { formatUser } from '../controller/formatters';
import { User } from '../types/User';

/*
  Select docs: https://atlassian.design/components/select/examples
*/

export type UsersSelectProps = {
  label: string;
  selectedUserAccountIds: string[];
  isMulti: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  includeAppUsers: boolean;
  isClearable: boolean;
  menuPortalTarget?: HTMLElement;
  filterUsers?: (usersToFilter: User[]) => Promise<User[]>;
  onUsersSelect: (selectedUsers: User[]) => Promise<void>;
}

const UsersSelect = (props: UsersSelectProps) => {

  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  const lastInvocationNumberRef = useRef<number>(0);

  const onChange = async (selection: undefined | Option | Option[]): Promise<void> => {
    // console.log(`UsersSelect.onChange: `, selectedOptions);
    let selectedUsers: User[] = [];
    if (!selection) {
      selectedUsers = [];
    } else if (props.isMulti) {
      const selectedOptions = selection as Option[];
      selectedUsers = await rebuildSelectedUsers(selectedOptions);
    } else {
      const selectedOption = selection as Option;
      selectedUsers = await rebuildSelectedUsers([selectedOption]);
    }
    await props.onUsersSelect(selectedUsers);
  }

  const rebuildSelectedUsers = async (selectedOptions: Option[]): Promise<User[]> => {
    const selectedUsers: User[] = [];
    for (const selectedOption of selectedOptions) {
      const user = currentUsers.find(user => user.accountId === selectedOption.value);
      if (user) {
        selectedUsers.push(user);
      } else {
        const userInExistingSelectedUsers = props.selectedUserAccountIds.find(userId => userId === selectedOption.value);
        // console.log(`UsersSelect.rebuildSelectedUsers: Could not find user with id ${selectedOption.value} in filteredUsers or selectedUsers`);
        const userInvocationResult = await jiraDataModel.getUserByAccountId(selectedOption.value);
        if (userInvocationResult.ok) {
          selectedUsers.push(userInvocationResult.data);
        } else {
          console.error(`UsersSelect.rebuildSelectedUsers: Could not find user with id ${selectedOption.value} in filteredUsers or selectedUsers`);
        }
      }
    }
    return Promise.resolve(selectedUsers);
  }

  const userToOption = (user: User): Option => {
    const option: Option = {
      label: formatUser(user),
      value: user.accountId,
    };
    return option;
  }

  const usersToOptions = (users: User[]): Option[] => {
    return users.map(userToOption);
  }

  const promiseOptions = async (inputValue: string): Promise<Option[]> => {
    lastInvocationNumberRef.current = lastInvocationNumberRef.current + 1;
    const myInvocationNumber = lastInvocationNumberRef.current;
    // console.log(`UsersSearhSelect: In promiseOptions(${inputValue})`);
    setLoadingOptions(true);
    try {
      let retrevedUsers = await jiraDataModel.searchUsers(inputValue);
      if (myInvocationNumber >= lastInvocationNumberRef.current) {
        if (props.filterUsers) {
          retrevedUsers = await props.filterUsers(retrevedUsers);
        }
        if (myInvocationNumber >= lastInvocationNumberRef.current) {
          setCurrentUsers(retrevedUsers);
          return usersToOptions(retrevedUsers);
        } else {
          // Return options from currentUsers since this invocation is stale.
          return usersToOptions(currentUsers);
        }
      } else {
        // Return options from currentUsers since this invocation is stale.
        return usersToOptions(currentUsers);
      }
    } finally {
      setLoadingOptions(false);
    } 
  }

  const buildInitiallySelectedOptions = (): any => {
    // console.log(`UsersSelect.buildInitiallySelectedOptions: props.selectedUserAccountIds = ${JSON.stringify(props.selectedUserAccountIds)}`);
    const selectedOptions: Option[] = [];
    for (const userAccountId of props.selectedUserAccountIds) {
      const user = currentUsers.find(user => user.accountId === userAccountId);
      if (user) {
        selectedOptions.push(userToOption(user));
        // console.log(`UsersSelect.buildInitiallySelectedOptions: Found user with accountId ${userAccountId} in currentUsers`);
      } else {
        // console.log(`UsersSelect.buildInitiallySelectedOptions: Could not find user with accountId ${userAccountId} in currentUsers`);
      }
    }
    if (props.isMulti) {
      return selectedOptions;
    } else {
      return selectedOptions.length > 0 ? selectedOptions[0] : undefined;
    }
  }

  const renderSelect = () => {
    const initiallySelectedOptions = buildInitiallySelectedOptions();
    // console.log(`UsersSelect.renderSelect: initiallySelectedOptions = ${JSON.stringify(initiallySelectedOptions)}`);
    return (
      <Select
        inputId="checkbox-select-example"
        testId="users-select"
        isMulti={props.isMulti}
        isRequired={true}
        defaultOptions
        cacheOptions
        isDisabled={props.isDisabled}
        isInvalid={props.isInvalid}
        isClearable={props.isClearable}
        isLoading={loadingOptions}
        value={buildInitiallySelectedOptions()}
				loadOptions={promiseOptions}
        placeholder={props.label}
        menuPortalTarget={props.menuPortalTarget}
        onChange={onChange}
      />
    );
  }

  return (
    <>
      <Label htmlFor="users-select">{props.label}</Label>
      {renderSelect()}
    </>
  );
}

export default UsersSelect;
