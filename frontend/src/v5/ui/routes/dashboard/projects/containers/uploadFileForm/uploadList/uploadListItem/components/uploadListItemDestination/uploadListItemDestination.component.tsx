/**
 *  Copyright (C) 2022 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { useState } from 'react';
import { IContainer } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useFormContext } from 'react-hook-form';
import { canUploadToBackend, prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { formatMessage } from '@/v5/services/intl';
import { ErrorTooltip } from '@controls/errorTooltip';
import { createFilterOptions } from '@mui/material';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { isCollaboratorRole } from '@/v5/store/store.helpers';
import { Autocomplete, DestinationInput, NewOrExisting } from './uploadListItemDestination.styles';
import { NewContainer } from './options/newContainer/newContainer.component';
import { AlreadyUsedName } from './options/alreadyUsedName/alreadyUsedName.component';
import { ExistingContainer } from './options/existingContainer/existingContainer.component';
import { OptionsBox } from './options';

interface IUploadListItemDestination {
	onPropertyChange: (name, value) => void;
	control?: any;
	errors?: any;
	disabled?: boolean;
	className?: string;
	defaultValue: string;
	containersNamesInUse: string[];
	setContainersNamesInUse: (names: string[]) => void;
}

const emptyOption = prepareSingleContainerData({
	_id: '',
	name: '',
	role: Role.NONE,
	isFavourite: false,
});
const getFilteredContainersOptions = createFilterOptions<IContainer>({ trim: true });

export const UploadListItemDestination = ({
	control,
	errors,
	disabled = false,
	className,
	onPropertyChange,
	defaultValue,
	containersNamesInUse,
	setContainersNamesInUse,
}: IUploadListItemDestination): JSX.Element => {
	const [selectedContainer, setSelectedContainer] = useState<IContainer>({ ...emptyOption, name: defaultValue });
	const [disableClearable, setDisableClearable] = useState(!defaultValue);
	const { getValues } = useFormContext();

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const federationsNames = FederationsHooksSelectors.selectFederations().map(({ name }) => name);
	const containers = ContainersHooksSelectors.selectContainers();
	const [newOrExisting, setNewOrExisting] = useState<NewOrExisting>(() => {
		if (!defaultValue) return '';
		return containers.find((c) => c.name === defaultValue) ? 'existing' : 'new';
	});

	const processingContainersNames = containers
		.filter((container) => !canUploadToBackend(container.status))
		.map(({ name }) => name);
	const errorMessage = errors.containerName?.message;

	const NO_OPTIONS_TEXT = isProjectAdmin
		? formatMessage({
			id: 'uploads.destination.noOptions.admin',
			defaultMessage: 'Start typing to create a new Container.',
		})
		: formatMessage({
			id: 'uploads.destination.noOptions.nonAdmin',
			defaultMessage: 'There are no Containers to upload to.',
		});

	const onFocus = () => {
		const containerNamesInModal = getValues('uploads')
			.map(({ containerName }) => containerName.trim())
			.filter(Boolean)
			.filter((name) => name !== selectedContainer.name);
		setContainersNamesInUse([...processingContainersNames, ...containerNamesInModal]);
	};

	const onDestinationChange = (value: IContainer): void => {
		const conversion = {
			containerId: value._id,
			containerName: value.name,
			containerCode: value.code,
			containerType: value.type || 'Uncategorised',
			containerUnit: value.unit || 'mm',
			containerDesc: value.desc,
		};
		Object.entries(conversion).forEach(([key, value]) => onPropertyChange(key, value));
	};

	const onChange = (_, newValue: IContainer) => {
		setDisableClearable(!newValue);
		if (!newValue) {
			setNewOrExisting('');
		} else {
			setNewOrExisting(newValue._id === '' ? 'new' : 'existing');
		}

		const newValueOrEmptyOption = newValue ? {
			...newValue,
			name: newValue.name.trim(),
		} : emptyOption;

		setSelectedContainer(newValueOrEmptyOption);
		onDestinationChange(newValueOrEmptyOption);
	};

	const onBlur = () => {
		setContainersNamesInUse(containersNamesInUse.concat(selectedContainer.name));
	};

	const getFilterOptions = (options: IContainer[], params) => {
		const inputValue = params.inputValue.trim();
		if (containersNamesInUse.length === containers.length && !inputValue) {
			// all the containers have been allocated already
			return [];
		}

		// filter out currently selected value and containers with insufficient permissions
		const filteredOptions = getFilteredContainersOptions(options, params)
			.filter(({ name }) => name !== selectedContainer.name)
			.filter(({ role }) => isCollaboratorRole(role));

		const containerNameExists = options.some(({ name }: IContainer) => inputValue === name);
		if (inputValue && !containerNameExists) {
			// create an extra option to transform into a
			// "add new container" OR "name already used" option
			filteredOptions.unshift({
				...emptyOption,
				name: inputValue.trim(),
			});
		}
		return filteredOptions;
	};

	const optionIsUsed = ({ name }: IContainer) => {
		const trimmedName = name.trim();
		if (trimmedName === selectedContainer.name) return false;
		return containersNamesInUse.includes(trimmedName);
	};

	const nameAlreadyExists = (name) => containersNamesInUse.concat(federationsNames).includes(name.trim());

	const getRenderOption = (optionProps, option: IContainer) => {
		const trimmedName = option?.name?.trim();

		if (option?._id === '') {
			// option is an extra
			if (nameAlreadyExists(trimmedName)) {
				return (<AlreadyUsedName {...optionProps} />);
			}

			if (isProjectAdmin && !errorMessage && !containers.map(({ name }) => name).includes(trimmedName)) {
				return (<NewContainer containerName={trimmedName} {...optionProps} />);
			}
		}

		// option is an existing container
		if (option._id || trimmedName === selectedContainer.name) {
			return (
				<ExistingContainer
					container={option}
					inUse={optionIsUsed(option)}
					{...optionProps}
				/>
			);
		}
		return (<></>);
	};

	return (
		<Autocomplete
			value={selectedContainer}
			className={className}
			disableClearable={disableClearable}
			filterOptions={getFilterOptions}
			getOptionDisabled={optionIsUsed}
			getOptionLabel={({ name }: IContainer) => name}
			ListboxComponent={OptionsBox}
			noOptionsText={NO_OPTIONS_TEXT}
			onBlur={onBlur}
			onChange={onChange}
			onFocus={onFocus}
			options={containers}
			renderOption={getRenderOption}
			renderInput={({ InputProps, ...params }) => (
				<DestinationInput
					control={control}
					formError={errors.containerName}
					name="containerName"
					disabled={disabled}
					value={selectedContainer}
					{...params}
					neworexisting={newOrExisting}
					InputProps={{
						...InputProps,
						startAdornment: !!errorMessage && (<ErrorTooltip>{errorMessage}</ErrorTooltip>),
					}}
				/>
			)}
		/>
	);
};
