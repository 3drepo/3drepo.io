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
import { useFormContext } from 'react-hook-form';
import { ErrorTooltip } from '@controls/errorTooltip';
import { IContainer } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { canUploadToBackend, prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { formatMessage } from '@/v5/services/intl';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { name as containerNameScheme } from '@/v5/validation/shared/validators';
import { isCollaboratorRole } from '@/v5/store/store.helpers';
import { DestinationAutocomplete, DestinationInput, NewOrExisting, OptionsBox } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { getFilteredDestinationOptions, sortByName } from '@components/shared/uploadFiles/uploadFiles.helpers';
import { AlreadyUsedName } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/alreadyUsedName/alreadyUsedName.component';
import { NewDestination } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/newDestination/newDestination.component';
import { NewDestinationInUse } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/newDestinationInUse/newDestinationInUse.component';
import { ExistingDestination } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/existingDestination/existingDestination.component';

const NO_OPTIONS_TEXT_ADMIN = formatMessage({
	id: 'container.uploads.destination.noOptions.admin',
	defaultMessage: 'Start typing to create a new Container.',
});

const NO_OPTIONS_TEXT_NON_ADMIN = formatMessage({
	id: 'container.uploads.destination.noOptions.nonAdmin',
	defaultMessage: 'There are no Containers to upload to.',
});

const EMPTY_OPTION = prepareSingleContainerData({
	_id: '',
	name: '',
	role: Role.NONE,
	isFavourite: false,
});

const NEW_ID = 'new';

interface IUploadListItemDestination {
	value?: string;
	revisionPrefix: string;
	disabled?: boolean;
	className?: string;
	index: number;
}
export const UploadListItemDestination = memo(({
	value,
	revisionPrefix,
	index,
	...props
}: IUploadListItemDestination): JSX.Element => {
	const [newOrExisting, setNewOrExisting] = useState<NewOrExisting>('');
	const [error, setError] = useState('');
	const { getValues, setValue } = useFormContext();

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const federationsNames = FederationsHooksSelectors.selectFederationsNames();
	const containers = ContainersHooksSelectors.selectContainers();
	const selectedContainer = containers.find((c) => c.name === value);

	const [processingContainersNames, setProcessingContainersNames] = useState([]);
	const [newContainersInModal, setNewContainersInModal] = useState([]);
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

		// filter out currently selected value and containers with insufficient permissions
		const filteredOptions = getFilteredDestinationOptions(options, params)
			.filter(({ name, role }) => name !== value && isCollaboratorRole(role));

		const containerNameExists = options.some(({ name }) => inputValue.toLowerCase() === (name || '').toLowerCase());

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
				const message = formatMessage({
					id: 'container.uploads.destination.addNewContainer',
					defaultMessage: 'Add <Bold>{name}</Bold> as a new container',
				}, {
					Bold: (val: string) => <b>{val}</b>,
					name: option.name,
				});
				return (<NewDestination message={message} containerName={option.name} {...optionProps} />);
			}
		}

		// option is an existing container
		if (option._id) {
			if (option._id === NEW_ID) {
				const message = formatMessage({
					id: 'container.uploads.destination.newContainer',
					defaultMessage: '<Bold>{name}</Bold> is a new container',
				}, {
					Bold: (val: string) => <b>{val}</b>,
					name: option.name,
				});
				return (<NewDestinationInUse message={message} containerName={option.name} {...optionProps}/>);
			}

			return (
				<ExistingDestination
					key={option.name}
					container={option}
					inUse={(nameIsTaken(option))}
					name={option.name}
					latestRevision={option.latestRevision}
					hasRevisions={!!option.revisionsCount}
					status={option.status}
					{...optionProps}
				/>
			);
		}
		return (<></>);
	};

	const onDestinationChange = (e, newVal: IContainer | null) => {
		setValue(`${revisionPrefix}.containerName`, newVal?.name?.trim() || '');
		setValue(`${revisionPrefix}.containerId`, newVal?._id || '', { shouldValidate: true });
	};

	const onOpen = () => {
		setNewContainersInModal(
			getValues('uploads')
				.filter(({ containerId, containerName }, i) => !containerId && i !== index && !!containerName)
				.map(({ containerName }) => ({ name:containerName, _id: NEW_ID, role: Role.COLLABORATOR })),
		);

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

	return (
		<DestinationAutocomplete
			{...props}
			defaultValue={selectedContainer}
			filterOptions={getFilterOptions}
			getOptionDisabled={nameIsTaken}
			getOptionLabel={(option: IContainer) => option.name || ''}
			ListboxComponent={OptionsBox}
			noOptionsText={isProjectAdmin ? NO_OPTIONS_TEXT_ADMIN : NO_OPTIONS_TEXT_NON_ADMIN}
			onInputChange={handleInputChange}
			onChange={onDestinationChange}
			onOpen={onOpen}
			options={sortByName([...containers, ...newContainersInModal])}
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
