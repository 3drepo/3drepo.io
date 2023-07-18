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

import { memo, useState } from 'react';
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
import { OptionsBox } from './options/optionsBox.styles';

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
}
export const UploadListItemDestination = memo(({
	revisionPrefix,
	disabled = false,
	className,
	...props
}: IUploadListItemDestination): JSX.Element => {
	const [newOrExisting, setNewOrExisting] = useState<NewOrExisting>('');
	const [error, setError] = useState('');
	const { getValues, setValue, register, trigger } = useFormContext();
	const value = getValues(`${revisionPrefix}.containerName`);

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const projectId = ProjectsHooksSelectors.selectCurrentProject();
	const federationsNames = FederationsHooksSelectors.selectFederationsNames();
	const containers = ContainersHooksSelectors.selectContainers();

	const [processingContainersNames, setProcessingContainersNames] = useState([]);
	const [containersNamesInModal, setContainerNamesInModal] = useState([]);

	const takenContainerNames = [
		...containersNamesInModal,
		...processingContainersNames,
		...federationsNames,
	];

	const sanitiseContainer = (baseContainer: IContainer): Partial<UploadItemFields> => ({
		containerId: baseContainer?._id || '',
		containerName: baseContainer?.name?.trim() || '',
		containerCode: baseContainer?.code || '',
		containerType: baseContainer?.type || 'Uncategorised',
		containerUnit: baseContainer?.unit || 'mm',
		containerDesc: baseContainer?.desc || '',
	});

	const testName = (containerName) => {
		try {
			containerNameScheme.validateSync(
				containerName,
				{ context: { alreadyExistingNames: takenContainerNames } },
			);
			setError('');
			setNewOrExisting(containers.find(({ name }) => name === containerName) ? 'existing' : 'new');
		} catch (validationError) {
			setError(`${validationError.message}`);
			setNewOrExisting('');
		}
	};

	const handleInputChange = (_, newValue: string) => {
		testName(newValue?.trim());
	};

	const filterOptions = (options: IContainer[], params) => {
		const inputValue = params.inputValue.trim();
		if (containersNamesInModal.length === containers.length && !inputValue) {
			// all the containers have been allocated already
			return [];
		}
		// if (!options.length && !inputValue) return [];

		// filter out currently selected value and containers with insufficient permissions
		const filteredOptions = getFilteredContainersOptions(options, params)
			.filter(({ name, role }) => name !== value && isCollaboratorRole(role));

		const containerNameExists = options.some(({ name }) => inputValue.toLowerCase() === name.toLowerCase());

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

	const nameIsTaken = ({ name }) => takenContainerNames.map((n) => n.toLowerCase()).includes(name.toLowerCase());

	const renderOption = (optionProps, option: IContainer) => {
		const handleOptionClick = (...args) => optionProps.onClick?.(...args);

		if (!option._id) {
			// option is an extra
			if (nameIsTaken(option)) {
				return (<AlreadyUsedName />);
			}

			if (isProjectAdmin) {
				return (<NewContainer containerName={option.name} {...optionProps} onClick={handleOptionClick} />);
			}
		}

		// option is an existing container
		if (option._id) {
			return (
				<ExistingContainer
					key={option.name}
					container={option}
					inUse={nameIsTaken(option)}
					{...optionProps}
					onClick={handleOptionClick}
				/>
			);
		}
		return (<></>);
	};

	const onSetDestinationChange = (e, newVal: IContainer | null) => {
		const sanitisedValue = sanitiseContainer(newVal);
		for (const [key, val] of Object.entries(sanitisedValue)) {
			setValue(`${revisionPrefix}.${key}`, val);
		}
		if (newVal?._id) {
			RevisionsActionsDispatchers.fetch(
				teamspace,
				projectId,
				newVal._id,
			);
		}
		trigger(`${revisionPrefix}.containerName`);
	};

	const onOpen = () => {
		setContainerNamesInModal(
			getValues('uploads')
				.map(({ containerName }) => containerName)
				.filter(({ containerName }) => containerName !== value)
				.filter(Boolean),
		);
		setProcessingContainersNames(
			containers
				.filter((container) => !canUploadToBackend(container.status))
				.map(({ name }) => name),
		);
	};

	return (
		<Autocomplete
			{...register(`${revisionPrefix}.containerName`)}
			value={containers.find((c) => c.name === value)}
			className={className}
			filterOptions={filterOptions}
			getOptionDisabled={nameIsTaken}
			getOptionLabel={(option: IContainer) => option.name || ''}
			ListboxComponent={OptionsBox}
			noOptionsText={isProjectAdmin ? NO_OPTIONS_TEXT_ADMIN : NO_OPTIONS_TEXT_NON_ADMIN}
			onInputChange={handleInputChange}
			onChange={onSetDestinationChange}
			onOpen={onOpen}
			options={containers}
			renderOption={renderOption}
			renderInput={({ InputProps, ...params }) => (
				<DestinationInput
					error={!!error}
					disabled={disabled}
					{...params}
					neworexisting={newOrExisting}
					InputProps={{
						...InputProps,
						startAdornment: !!error && (<ErrorTooltip>{error}</ErrorTooltip>),
					}}
				/>
			)}
			{...props}
		/>
	);
}, (prev, next) => prev.revisionPrefix === next.revisionPrefix);
