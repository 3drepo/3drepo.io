/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { memo, useEffect, useMemo, useState, type JSX } from 'react';
import { useFormContext } from 'react-hook-form';
import { ErrorTooltip } from '@controls/errorTooltip';
import { createFilterOptions } from '@mui/material';
import { DrawingsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { canUploadToBackend, fullDrawing } from '@/v5/store/drawings/drawings.helpers';
import { formatMessage } from '@/v5/services/intl';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { isCollaboratorRole } from '@/v5/store/store.helpers';
import { orderBy } from 'lodash';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { name as drawingNameScheme } from '@/v5/validation/shared/validators';
import { DestinationAutocomplete, DestinationInput, NewOrExisting, OptionsBox } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { AlreadyUsedName } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/alreadyUsedName/alreadyUsedName.component';
import { NewDestination } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/newDestination/newDestination.component';
import { NewDestinationInUse } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/newDestinationInUse/newDestinationInUse.component';
import { ExistingDestination } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/existingDestination/existingDestination.component';

const NO_OPTIONS_TEXT_ADMIN = formatMessage({
	id: 'drawing.uploads.destination.noOptions.admin',
	defaultMessage: 'Start typing to create a new Drawing.',
});

const NO_OPTIONS_TEXT_NON_ADMIN = formatMessage({
	id: 'drawing.uploads.destination.noOptions.nonAdmin',
	defaultMessage: 'There are no Drawings to upload to.',
});

const EMPTY_OPTION = fullDrawing({
	_id: '',
	name: '',
	role: Role.NONE,
	isFavourite: false,
});

const NEW_ID = 'new';

const getFilteredDrawingsOptions = createFilterOptions<IDrawing>({ trim: true });

const sortByName = (options) => orderBy(options, ({ name }) => name.toLowerCase());

interface IUploadListItemDestination {
	value?: string;
	revisionPrefix: string;
	disabled?: boolean;
	className?: string;
	index: number;
	onSelectNewDestination: () => void;
	name: string,
	inputRef?: any;
	helperText?: string,
	error?: boolean,
}
export const UploadListItemDestination = memo(({
	value,
	revisionPrefix,
	index,
	onSelectNewDestination,
	name,
	inputRef,
	error,
	helperText,
	...props
}: IUploadListItemDestination): JSX.Element => {
	const [newOrExisting, setNewOrExisting] = useState<NewOrExisting>('');
	const { getValues, setValue, setError, clearErrors } = useFormContext();

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const drawings = DrawingsHooksSelectors.selectDrawings();
	const selectedDrawing = useMemo(() => drawings.find((c) => c.name === value), [drawings, value]);

	const [processingDrawingsNames, setProcessingDrawingsNames] = useState([]);
	const [newDrawingsInModal, setNewDrawingsInModal] = useState([]);
	const [drawingsNamesInModal, setDrawingNamesInModal] = useState([]);

	const takenDrawingNames = [
		...drawingsNamesInModal,
		...processingDrawingsNames,
	];

	const [currentDrawingId, currentDrawingName] = getValues([`${revisionPrefix}.drawingId`, `${revisionPrefix}.drawingName`]);

	const handleInputChange = (_, newValue: string) => {
		const trimmedValue = newValue?.trim();

		try {
			drawingNameScheme.validateSync(
				trimmedValue,
				{ context: { alreadyExistingNames: [] } },
			);

			if (error) {
				clearErrors(name);
			}

			setNewOrExisting(drawings.find((drawing) => drawing.name === trimmedValue) ? 'existing' : 'new');
		} catch (validationError) {
			if (validationError.message !== helperText) {
				setError(name, validationError);
			}

			setNewOrExisting('');
		}
	};

	const getFilterOptions = (options: IDrawing[], params) => {
		const inputValue = params.inputValue.trim();

		// filter out currently selected value and drawings with insufficient permissions
		const filteredOptions = getFilteredDrawingsOptions(options, params)
			.filter((option) => option.name !== value && isCollaboratorRole(option.role));

		const drawingNameExists = options.some((option) => inputValue.toLowerCase() === (option.name || '').toLowerCase());

		if (inputValue && !drawingNameExists && isProjectAdmin) {
			// create an extra option to transform into a
			// "add new drawing" OR "name already used" option
			filteredOptions.unshift({
				...EMPTY_OPTION,
				name: inputValue.trim(),
			});
		}

		return filteredOptions;
	};

	const nameIsTaken = (drawing) => takenDrawingNames.map((n) => n.toLowerCase()).includes(drawing.name.toLowerCase());

	const renderOption = (optionProps, option: IDrawing) => {
		if (!option._id) {
			// option is an extra
			if (nameIsTaken(option)) {
				return (<AlreadyUsedName key={option.name} />);
			}

			if (isProjectAdmin && !error) {
				const message = formatMessage({
					id: 'drawing.uploads.destination.addNewDestination',
					defaultMessage: 'Add <Bold>{name}</Bold> as a new drawing',
				}, { Bold: (val: string) => <b>{val}</b>, name: option.name });
				return (<NewDestination message={message} {...optionProps} />);
			}
		}

		// option is an existing drawing
		if (option._id) {
			if (option._id === NEW_ID) {
				const message = formatMessage({
					id: 'drawing.uploads.destination.newDrawing',
					defaultMessage: ' <Bold>{name}</Bold> is a new drawing',
				}, { Bold: (val: string) => <b>{val}</b>, name: option.name });
				return (<NewDestinationInUse message={message} {...optionProps} />);
			}

			return (
				<ExistingDestination
					key={option.name}
					emptyLabel={formatMessage({ id: 'drawingsUploads.list.item.title.latestRevision.empty', defaultMessage: 'Drawing empty' })}
					inUse={nameIsTaken(option)}
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

	const onDestinationChange = (e, newVal: IDrawing | null) => {
		setValue(`${revisionPrefix}.drawingName`, newVal?.name?.trim() || '');
		setValue(`${revisionPrefix}.drawingId`, newVal?._id || '', { shouldValidate: true });
	};

	const onOpen = () => {
		setNewDrawingsInModal(
			getValues('uploads')
				.filter(({ drawingId, drawingName }, i) => !drawingId && i !== index && !!drawingName)
				.map(({ drawingName }) => ({ name: drawingName, _id: NEW_ID, role: Role.COLLABORATOR })),
		);

		setDrawingNamesInModal(
			getValues('uploads')
				.map(({ drawingName }) => drawingName)
				.filter((drawingName) => drawingName !== value)
				.filter(Boolean),
		);

		setProcessingDrawingsNames(
			drawings
				.filter((drawing) => !canUploadToBackend(drawing.status))
				.map((drawing) => drawing.name),
		);
	};

	useEffect(() => {
		if (currentDrawingName && !currentDrawingId) {
			onSelectNewDestination();
		}
	}, [currentDrawingName]);

	return (
		<DestinationAutocomplete
			{...props}
			value={selectedDrawing}
			filterOptions={getFilterOptions}
			getOptionDisabled={nameIsTaken}
			getOptionLabel={(option: IDrawing) => option.name || ''}
			ListboxComponent={OptionsBox}
			noOptionsText={isProjectAdmin ? NO_OPTIONS_TEXT_ADMIN : NO_OPTIONS_TEXT_NON_ADMIN}
			onInputChange={handleInputChange}
			onChange={onDestinationChange}
			onOpen={onOpen}
			options={sortByName([...drawings, ...newDrawingsInModal])}
			renderOption={renderOption}
			disableClearable={!value}
			renderInput={({ InputProps, ...params }) => (
				<DestinationInput
					error={error}
					{...params}
					neworexisting={newOrExisting}
					inputRef={inputRef}
					InputProps={{
						...InputProps,
						startAdornment: error && (<ErrorTooltip>{helperText}</ErrorTooltip>),
					}}
				/>
			)}
		/>
	);
}, (prev, next) => (
	prev.revisionPrefix === next.revisionPrefix &&
	prev.value === next.value &&
	prev.disabled === next.disabled &&
	prev.error === next.error
));
