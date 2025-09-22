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

import { memo,  useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ErrorTooltip } from '@controls/errorTooltip';
import { AutocompleteRenderOptionState } from '@mui/material';
import { DrawingsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { canUploadToBackend } from '@/v5/store/drawings/drawings.helpers';
import { formatMessage } from '@/v5/services/intl';
import { isCollaboratorRole } from '@/v5/store/store.helpers';
import { name as drawingNameScheme } from '@/v5/validation/shared/validators';
import { DestinationAutocomplete, DestinationInput, OptionsBox } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { AlreadyUsedName } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/alreadyUsedName/alreadyUsedName.component';
import { NewDestination } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/newDestination/newDestination.component';
import { NewDestinationInUse } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/newDestinationInUse/newDestinationInUse.component';
import { ExistingDestination } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/existingDestination/existingDestination.component';
import { ErrorOption } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/options/alreadyUsedName/alreadyUsedName.styles';
import { DrawingUploadForm } from '@/v5/store/drawings/revisions/drawingRevisions.types';

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
	revisionPrefix: `uploads.${number}`;
	disabled?: boolean;
	className?: string;
	index: number;
	onSelectNewDestination: () => void;
	name:  `uploads.${number}.name` |  `uploads.${number}.drawingName`,
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
	const { getValues, setValue, setError, clearErrors } = useFormContext<DrawingUploadForm>();

	// The value that is typed in the input of the autocomplete is inconsistent
	// Sometimes it can come empty (getFilteredOptions(,params), params.inputValue) even when 
	// theres something in there
	const [typedInVal, setTypedInVal] = useState(value);
	const [newDrawingsInModal, setNewDrawingsInModal] = useState([]);
	const [unavailableNames, setUnavailableNames] = useState(new Set<string>());

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const drawingsByName =  {};
	const drawingsNames = [];
	const drawings = DrawingsHooksSelectors.selectDrawings();

	drawings.forEach(({ name: drawingName, ...rest }) => {
		drawingsNames.push(drawingName);
		drawingsByName[drawingName.toLowerCase()] = { name: drawingName, ...rest };
	});

	const getDrawing = (drawingName: string = '') =>  drawingsByName[drawingName.trim().toLowerCase()];
	const nameIsTaken = (drawingName: string = '') => unavailableNames.has(drawingName.trim().toLowerCase());

	const handleInputChange = (_, newValue: string) => {
		const trimmedValue = newValue?.trim();
		setTypedInVal(trimmedValue);
		const drawing = getDrawing(trimmedValue);

		try {
			drawingNameScheme.validateSync(trimmedValue);

			if (nameIsTaken(trimmedValue)) {
				throw (new Error(ALREADY_IN_USE));
			}

			if (!isProjectAdmin && !drawing) {
				throw (new Error(NO_OPTIONS_TEXT_NON_ADMIN));
			}

			clearErrors(name);
		} catch (validationError) {
			if (validationError.message !== helperText) {
				setError(name, validationError);
			}
		}
	};

	// The options that will be displayed while typing in the input:
	const getFilteredOptions = (options: string[], params) => {
		// The typed in value
		const inputValue = params.inputValue.trim();
		// Filter out currently selected value and drawings with insufficient permissions
		const filtered = (options).filter((option) => {
			const drawing = getDrawing(option);
			return (!drawing ||  isCollaboratorRole(drawing.role)) && option.toLowerCase().includes(inputValue.toLowerCase());
		});

		// If the entered value in the input is not part of the options is a new drawing
		// We add the new drawing as an option so that renderOption will show "Add XXXX as a new drawing"
		// or "Already in use" if the drawing name is already taken
		const inputInOptions = options.some((opt) => opt.toLowerCase() === inputValue.toLowerCase());
		
		if (!inputInOptions && isProjectAdmin && inputValue) { // Needs to be a project admin to add a new drawing.
			filtered.unshift(inputValue);
		} 

		if (!isProjectAdmin && inputValue && !filtered.length) {
			return [NO_OPTIONS_TEXT_NON_ADMIN];
		}

		return filtered;
	};

	const renderOption = (optionProps, option: string,  state: AutocompleteRenderOptionState) => {
		const optionDrawing = getDrawing(option);

		if (option === NO_OPTIONS_TEXT_NON_ADMIN) {
			return (<ErrorOption key={option}>{option}</ErrorOption>);
		}

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

	const onDestinationChange = (
		e, 
		selectedOption: string, 
	) => {
		const newValue = selectedOption || '';
		const drawing = getDrawing(newValue);
		setValue(name, newValue);
		setValue(`${revisionPrefix}.drawingId`, drawing?._id, { shouldValidate: true });

		if (!!newValue && !error && !drawing) {
			onSelectNewDestination();
		}
	};

	const onOpen = () => {
		const otherDrawingsInModal = getValues('uploads').filter(({ drawingName }, i) => i !== index && !!drawingName.trim());
		
		setNewDrawingsInModal(
			otherDrawingsInModal
				.filter(({ drawingId }) => !drawingId)
				.map(({ drawingName }) => drawingName),
		);
		
		const drawingNamesInModal = otherDrawingsInModal
			.map(({ drawingName }) => drawingName);

		const processingNames = drawings
			.filter((drawing) => !canUploadToBackend(drawing.status))
			.map((drawing) => drawing.name.toLowerCase());

		// The taken drawing names are in lowercase to make the easier to compare
		setUnavailableNames(new Set(drawingNamesInModal.concat(processingNames)));
	};

	const options = [...drawingsNames, ...newDrawingsInModal].sort();
	const newOrExisting =  !typedInVal ? '' : !getDrawing(typedInVal) ? 'new' : 'existing';
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
			onInputChange={handleInputChange}
			onChange={onDestinationChange}
			onOpen={onOpen}
			options={options}
			renderOption={renderOption}
			disableClearable={!typedInVal}
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
			autoHighlight={!!typedInVal}
			autoSelect={!!typedInVal}
		/>
	);
}, (prev, next) => (
	prev.revisionPrefix === next.revisionPrefix &&
	prev.value === next.value &&
	prev.disabled === next.disabled &&
	prev.error === next.error
));
