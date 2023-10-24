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

import { memo, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ErrorTooltip } from '@controls/errorTooltip';
import { createFilterOptions } from '@mui/material';
import { IContainer, UploadItemFields } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { canUploadToBackend, prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { formatMessage } from '@/v5/services/intl';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { name as containerNameScheme } from '@/v5/validation/containerAndFederationSchemes/validators';
import { isCollaboratorRole } from '@/v5/store/store.helpers';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { DestinationAutocomplete, DestinationInput, NewOrExisting } from './uploadListItemDestination.styles';
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
	value?: string;
	revisionPrefix: string;
	disabled?: boolean;
	className?: string;
}
export const UploadListItemDestination = memo(({
	value,
	revisionPrefix,
	className,
	...props
}: IUploadListItemDestination): JSX.Element => {
	const [newOrExisting, setNewOrExisting] = useState<NewOrExisting>('');
	const [error, setError] = useState('');
	const { getValues, setValue } = useFormContext();

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const projectId = ProjectsHooksSelectors.selectCurrentProject();
	const federationsNames = FederationsHooksSelectors.selectFederationsNames();
	const containers = ContainersHooksSelectors.selectContainers();
	const selectedContainer = containers.find((c) => c.name === value);

	const [processingContainersNames, setProcessingContainersNames] = useState([]);
	const [containersNamesInModal, setContainerNamesInModal] = useState([]);

	const takenContainerNames = [
		...containersNamesInModal,
		...processingContainersNames,
		...federationsNames,
	];

	const handleInputChange = (_, newValue: string) => {
		const trimmedValue = newValue?.trim();
		try {
			containerNameScheme.validateSync(
				trimmedValue,
				{ context: { alreadyExistingNames: federationsNames } },
			);
			setError('');
			setNewOrExisting(containers.find(({ name }) => name === trimmedValue) ? 'existing' : 'new');
		} catch (validationError) {
			setError(validationError.message);
			setNewOrExisting('');
		}
	};

	const getFilterOptions = (options: IContainer[], params) => {
		const inputValue = params.inputValue.trim();
		if (!inputValue && (containersNamesInModal.length === containers.length || !options.length)) {
			// if all the containers have been allocated already or there are no containers at all
			return [];
		}

		// filter out currently selected value and containers with insufficient permissions
		const filteredOptions = getFilteredContainersOptions(options, params)
			.filter(({ name, role }) => name !== value && isCollaboratorRole(role));

		const containerNameExists = options.some(({ name }) => inputValue.toLowerCase() === name.toLowerCase());
		if (inputValue && !containerNameExists && isProjectAdmin) {
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
		if (!option._id) {
			// option is an extra
			if (nameIsTaken(option)) {
				return (<AlreadyUsedName key={option.name} />);
			}

			if (isProjectAdmin) {
				return (<NewContainer containerName={option.name} {...optionProps} />);
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
				/>
			);
		}
		return (<></>);
	};

	const sanitiseContainer = (baseContainer: IContainer): Partial<UploadItemFields> => ({
		containerCode: baseContainer?.code || '',
		containerType: baseContainer?.type || 'Uncategorised',
		containerUnit: baseContainer?.unit || 'mm',
	});

	const onDestinationChange = (e, newVal: IContainer | null) => {
		const sanitisedValue = sanitiseContainer(newVal);
		if (newVal?._id) {

			ContainersActionsDispatchers.fetchContainerSettings(
				teamspace,
				projectId,
				newVal._id,
			);

			for (const [key, val] of Object.entries(sanitisedValue)) {
				setValue(`${revisionPrefix}.${key}`, val);
			}
		}

		setValue(`${revisionPrefix}.containerName`, newVal?.name?.trim() || '');
		setValue(`${revisionPrefix}.containerId`, newVal?._id || '');
	};

	const onOpen = () => {
		setContainerNamesInModal(
			getValues('uploads')
				.map(({ containerName }) => containerName)
				.filter((containerName) => containerName !== value)
				.filter(Boolean),
		);
		setProcessingContainersNames(
			containers
				.filter((container) => !canUploadToBackend(container.status))
				.map(({ name }) => name),
		);
	};

	useEffect(() => {
		// This updates the container desc after it is fetched in the fetchContainerSettings
		setValue(`${revisionPrefix}.containerDesc`, selectedContainer?.desc);
	}, [selectedContainer]);


	return (
		<DestinationAutocomplete
			{...props}
			defaultValue={selectedContainer}
			className={className}
			filterOptions={getFilterOptions}
			getOptionDisabled={nameIsTaken}
			getOptionLabel={(option: IContainer) => option.name || ''}
			ListboxComponent={OptionsBox}
			noOptionsText={isProjectAdmin ? NO_OPTIONS_TEXT_ADMIN : NO_OPTIONS_TEXT_NON_ADMIN}
			onInputChange={handleInputChange}
			onChange={onDestinationChange}
			onOpen={onOpen}
			options={containers}
			renderOption={renderOption}
			renderInput={({ InputProps, ...params }) => (
				<DestinationInput
					error={!!error}
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
}, (prev, next) => prev.revisionPrefix === next.revisionPrefix && prev.value === next.value && prev.disabled === next.disabled);
