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

import { memo, useEffect,  useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ErrorTooltip } from '@controls/errorTooltip';
import { AutocompleteRenderOptionState } from '@mui/material';
import { DrawingsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { canUploadToBackend } from '@/v5/store/drawings/drawings.helpers';
import { formatMessage } from '@/v5/services/intl';
import { isCollaboratorRole } from '@/v5/store/store.helpers';
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

const ALREADY_IN_USE = formatMessage({
	id: 'uploads.destination.name.error.alreadyExists',
	defaultMessage: 'This name is already used within this project',
});

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
	const drawingsByName =  {};
	const drawingsNames = [];
	const drawings = DrawingsHooksSelectors.selectDrawings();

	drawings.forEach(({ name: drawingName, ...rest }) => {
		drawingsNames.push(drawingName);
		drawingsByName[drawingName.toLowerCase()] = { name: drawingName, ...rest };
	});

	const [newDrawingsInModal, setNewDrawingsInModal] = useState([]);
	const [takenDrawingNames, setTakenDrawingNames] = useState(new Set<string>());
	const nameIsTaken = (drawingName: string) => takenDrawingNames.has(drawingName.toLowerCase());

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

			setNewOrExisting(drawingsNames.find((drawingName) => drawingName === trimmedValue) ? 'existing' : 'new');
		} catch (validationError) {
			if (validationError.message !== helperText) {
				setError(name, validationError);
			}

			setNewOrExisting('');
		}
	};

	// The options that will be displayed while typing in the input:
	const getFilteredOptions = (options: string[], params) => {
		// The typed in value
		const inputValue = params.inputValue.trim();
		
		// Filter out currently selected value and drawings with insufficient permissions
		const filtered = (options).filter((option) => {
			const drawing = drawingsByName[option.toLowerCase()];
			return (!drawing || isCollaboratorRole(drawing.role)) && option.toLowerCase().includes(inputValue.toLowerCase());
		});


		// If the entered value in the input is not part of the options is a new drawing
		// We add the new drawing as an option so that renderOption will show "Add XXXX as a new drawing"
		// or "Already in use" if the drawing name is already taken
		const inputInOptions = options.some((opt) => opt.toLowerCase() === inputValue.toLowerCase());
		
		if (!inputInOptions && isProjectAdmin && inputValue) { // Needs to be a project admin to add a new drawing.
			filtered.unshift(inputValue);
		} 

		return filtered;
	};

	const renderOption = (optionProps, option: string,  state: AutocompleteRenderOptionState) => {
		const optionDrawing = drawingsByName[option.toLowerCase()];

		if (!optionDrawing) { // Is a new drawing
			// If the name is taken and it's the same name Im typing (option === state.inputValue)
			// Show name already in use:
			if (nameIsTaken(option)  && option === state.inputValue) {
				return (<AlreadyUsedName key={option} />);
			} 

			// If the name is taken but is NOT the same name Im typing (option === state.inputValue)
			// Show name already in use and disabled with the data:
			if (nameIsTaken(option) && option !== state.inputValue) {
				const message = formatMessage({
					id: 'drawing.uploads.destination.newDrawing',
					defaultMessage: ' <Bold>{name}</Bold> is a new drawing',
				}, { Bold: (val: string) => <b>{val}</b>, name: option });
				return (<NewDestinationInUse message={message} {...optionProps}  key={option} />);
			} 

		 	// If the name is not taken the option shows "Add {option} as a new drawing"
			if (isProjectAdmin && !error) {
				const message = formatMessage({
					id: 'drawing.uploads.destination.addNewDestination',
					defaultMessage: 'Add <Bold>{name}</Bold> as a new drawing',
				}, { Bold: (val: string) => <b>{val}</b>, name: option });
				return (<NewDestination message={message} {...optionProps}  key={option} />);
			}

		} else {
			// option is an existing drawing
			return (
				<ExistingDestination
					key={option}
					emptyLabel={formatMessage({ id: 'drawingsUploads.list.item.title.latestRevision.empty', defaultMessage: 'Drawing empty' })}
					inUse={nameIsTaken(option)}
					name={option}
					latestRevision={optionDrawing.latestRevision}
					hasRevisions={!!optionDrawing.revisionsCount}
					status={optionDrawing.status}
					{...optionProps}
				/>
			);
		}
	};

	const onDestinationChange = (e, newVal: string | null = '') => {
		const drawing = drawingsByName[newVal.toLowerCase()];
		if (nameIsTaken(newVal)) {
			setError(name, { message: ALREADY_IN_USE });
			setValue(`${revisionPrefix}.drawingId`, '');
			return;
		} 

		setValue(`${revisionPrefix}.drawingName`, newVal);
		setValue(`${revisionPrefix}.drawingId`, drawing?._id, { shouldValidate: true });
	};

	const onOpen = () => {
		setNewDrawingsInModal(
			getValues('uploads')
				.filter(({ drawingId, drawingName }, i) => !drawingId && i !== index && !!drawingName)
				.map(({ drawingName }) => drawingName),
		);
		//
		
		const drawingNamesInModal = getValues('uploads')
			.map(({ drawingName }) => (drawingName || '').toLowerCase())
			.filter((drawingName) => drawingName !== value.toLowerCase())
			.filter(Boolean);

		const processingNames = drawings
			.filter((drawing) => !canUploadToBackend(drawing.status))
			.map((drawing) => drawing.name.toLowerCase());

		// The taken drawing names are in lowercase to make the easier to compare
		setTakenDrawingNames(new Set(drawingNamesInModal.concat(processingNames)));
	};

	useEffect(() => {
		if (currentDrawingName && !currentDrawingId) {
			onSelectNewDestination();
		}
	}, [currentDrawingName]);

	const options = [...drawingsNames, ...newDrawingsInModal];

	return (
		<DestinationAutocomplete
			{...props}
			freeSolo
			forcePopupIcon
			value={value}
			filterOptions={getFilteredOptions}
			getOptionDisabled={nameIsTaken}
			getOptionLabel={(option:string) => option || ''}
			ListboxComponent={OptionsBox}
			noOptionsText={isProjectAdmin ? NO_OPTIONS_TEXT_ADMIN : NO_OPTIONS_TEXT_NON_ADMIN}
			onInputChange={handleInputChange}
			onChange={onDestinationChange}
			onOpen={onOpen}
			options={options}
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
