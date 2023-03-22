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
import { IContainer, UploadItemFields } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { useFormContext } from 'react-hook-form';
import { canUploadToBackend, prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { formatMessage } from '@/v5/services/intl';
import { ErrorTooltip } from '@controls/errorTooltip';
import { createFilterOptions } from '@mui/material';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { name as containerNameScheme } from '@/v5/validation/containerAndFederationSchemes/validators';
import { isCollaboratorRole } from '@/v5/store/store.helpers';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Autocomplete, DestinationInput, NewOrExisting } from './uploadListItemDestination.styles';
import { NewContainer } from './options/newContainer/newContainer.component';
import { AlreadyUsedName } from './options/alreadyUsedName/alreadyUsedName.component';
import { ExistingContainer } from './options/existingContainer/existingContainer.component';
import { OptionsBox } from './options/optionsBox.component';

const NO_OPTIONS_TEXT_ADMIN = formatMessage({
	id: 'uploads.destination.noOptions.admin',
	defaultMessage: 'Start typing to create a new Container.',
});

const NO_OPTIONS_TEXT_NON_ADMIN = formatMessage({
	id: 'uploads.destination.noOptions.nonAdmin',
	defaultMessage: 'There are no Containers to upload to.',
});

const EMPTY_OPTION = prepareSingleContainerData({
	_id: '',
	name: '',
	role: Role.NONE,
	isFavourite: false,
});

const getFilteredContainersOptions = createFilterOptions<IContainer>({ trim: true });

interface IUploadListItemDestination {
	revisionPrefix: string;
	disabled?: boolean;
	className?: string;
	defaultValue: string;
}
export const UploadListItemDestination = ({
	disabled = false,
	className,
	revisionPrefix,
	defaultValue,
}: IUploadListItemDestination): JSX.Element => {
	const [selectedContainer, setSelectedContainer] = useState<IContainer>({ ...EMPTY_OPTION, name: defaultValue });
	const [disableClearable, setDisableClearable] = useState(!defaultValue);
	const [newOrExisting, setNewOrExisting] = useState<NewOrExisting>('');
	const [error, setError] = useState('');
	const { getValues, setValue, trigger } = useFormContext();

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const projectId = ProjectsHooksSelectors.selectCurrentProject();
	const federationsNames = FederationsHooksSelectors.selectFederations().map(({ name }) => name);
	const containers = ContainersHooksSelectors.selectContainers();

	const processingContainersNames = containers
		.filter((container) => !canUploadToBackend(container.status))
		.map(({ name }) => name);

	const containersNamesInModal = getValues('uploads')
		.map(({ containerName }) => containerName.trim())
		.filter(Boolean)
		.filter((name) => name !== selectedContainer.name);

	const containersNamesInUse = [
		...containersNamesInModal,
		...processingContainersNames,
		...federationsNames,
	];

	const getValidContainer = (baseContainer: IContainer): Partial<UploadItemFields> => ({
		containerId: baseContainer._id,
		containerName: baseContainer.name,
		containerCode: baseContainer.code || '',
		containerType: baseContainer.type || 'Uncategorised',
		containerUnit: baseContainer.unit || 'mm',
		containerDesc: baseContainer.desc || '',
	});

	const testName = (containerName) => {
		try {
			containerNameScheme.validateSync(
				containerName,
				{ context: { alreadyExistingNames: containersNamesInUse } },
			);
			setError('');
			setNewOrExisting(containers.find(({ name }) => name === containerName) ? 'existing' : 'new');
		} catch (validationError) {
			setError(validationError.message);
			setNewOrExisting('');
		}
	};

	const updateDestination = (containerName: string) => {
		const container = containers.find(({ name }) => name === containerName);
		setDisableClearable(!containerName);
		if (!containerName) {
			setNewOrExisting('');
		} else {
			setNewOrExisting(container ? 'existing' : 'new');
		}

		const newValueOrEmptyOption = container || {
			...EMPTY_OPTION,
			name: containerName,
		};

		setSelectedContainer(newValueOrEmptyOption);
		Object.entries(getValidContainer(newValueOrEmptyOption)).forEach(([key, value]) => {
			const name = `${revisionPrefix}.${key}`;
			setValue(name, value);
			trigger(name);
		});

		if (container) {
			RevisionsActionsDispatchers.fetch(
				teamspace,
				projectId,
				container._id,
			);
		}
	};

	const handleInputChange = (_, newValue: string, reason: 'clear' | 'reset' | 'input') => {
		const containerName = newValue?.trim();
		testName(containerName);
		if (reason === 'input' || (reason === 'reset' && !newValue)) return;

		updateDestination(containerName);
	};

	const getFilterOptions = (options: IContainer[], params) => {
		const inputValue = params.inputValue.trim();
		if (containersNamesInModal.length === containers.length && !inputValue) {
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
				...EMPTY_OPTION,
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
		const handleOptionClick = (...args) => {
			optionProps.onClick?.(...args);
			updateDestination(trimmedName);
		};

		if (option?._id === '') {
			// option is an extra
			if (nameAlreadyExists(trimmedName)) {
				return (<AlreadyUsedName />);
			}

			if (isProjectAdmin && !error && !containers.map(({ name }) => name).includes(trimmedName)) {
				return (<NewContainer containerName={trimmedName} {...optionProps} onClick={handleOptionClick} />);
			}
		}

		// option is an existing container
		if (option._id || trimmedName === selectedContainer.name) {
			return (
				<ExistingContainer
					container={option}
					inUse={optionIsUsed(option)}
					{...optionProps}
					onClick={handleOptionClick}
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
			noOptionsText={isProjectAdmin ? NO_OPTIONS_TEXT_ADMIN : NO_OPTIONS_TEXT_NON_ADMIN}
			onInputChange={handleInputChange}
			options={containers}
			renderOption={getRenderOption}
			renderInput={({ InputProps, ...params }) => (
				<DestinationInput
					error={!!error}
					disabled={disabled}
					value={selectedContainer}
					{...params}
					neworexisting={newOrExisting}
					InputProps={{
						...InputProps,
						startAdornment: !!error && (<ErrorTooltip>{error}</ErrorTooltip>),
					}}
				/>
			)}
		/>
	);
};
