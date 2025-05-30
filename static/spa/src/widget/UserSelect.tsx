import React, { useEffect, useState } from 'react';
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
  selectedUsers: User[];
  isMulti: boolean;
  isDisabled?: boolean;
  includeAppUsers: boolean;
  isClearable: boolean;
  filterUsers?: (usersToFilter: User[]) => Promise<User[]>;
  onUsersSelect: (selectedUsers: User[]) => Promise<void>;
}

const UsersSelect = (props: UsersSelectProps) => {

  const [loadingOption, setLoadingOption] = useState<boolean>(false);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);

  const onChange = async (selection: undefined | Option | Option[]): Promise<void> => {
    // console.log(`UsersSelect.onChange: `, selectedOptions);
    let selectedUsers: User[] = [];
    if (!selection) {
      selectedUsers = [];
    } else if (props.isMulti) {
      const selectedOptions = selection as Option[];
      for (const selectedOption of selectedOptions) {
        const user = currentUsers.find(user => user.accountId === selectedOption.value);
        if (user) {
          selectedUsers.push(user);
        }
      }
    } else {
      const selectedOption = selection as Option;
      if (selectedOption.value) {
        const selectedUser = currentUsers.find(user => user.accountId === selectedOption.value);
        selectedUsers = [selectedUser];
      } else {
        selectedUsers = [];
      }
    }
    await props.onUsersSelect(selectedUsers);
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
    // console.log(`UsersSearhSelect: In promiseOptions(${inputValue})`);
    setLoadingOption(true);
    try {
      let retrevedUsers = await jiraDataModel.searchUsers(inputValue);
      if (props.filterUsers) {
        retrevedUsers = await props.filterUsers(retrevedUsers);
      }
      setCurrentUsers(retrevedUsers);
      return usersToOptions(retrevedUsers);
    } finally {
      setLoadingOption(false);
    } 
  }

  const renderSelect = () => {
    return (
      <Select
        inputId="checkbox-select-example"
        testId="users-select"
        isMulti={props.isMulti}
        isRequired={true}
        defaultOptions
        cacheOptions
        isDisabled={props.isDisabled}
        isClearable={props.isClearable}
				loadOptions={promiseOptions}
        placeholder={props.label}
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
