/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React, { useState } from 'react';
import ChevronIcon from '@assets/icons/chevron.svg';
import ClearIcon from '@assets/icons/clear_circle.svg';
import MuiAutocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { DestinationOption } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { useFormContext } from 'react-hook-form';
import { TextInput, ErrorIcon } from './uploadListItemDestination.styles';
import { NewContainer } from './options/newContainer';
import { ExistingContainer } from './options/existingContainer';

interface IUploadListItemDestination {
	onChange: (option) => void;
	errorMessage: string;
	disabled?: boolean;
	className?: string;
}

const emptyOption = { name: '', _id: '', latestRevision: '' };
const filter = createFilterOptions<{_id: string; name: string; latestRevision: string;}>();

export const UploadListItemDestination: React.FC<IUploadListItemDestination> = ({
	errorMessage,
	disabled = false,
	className,
	onChange,
	...props
}) => {
	const [value, setValue] = useState(emptyOption);
	const [state, setState] = useState(errorMessage ? 'error' : '');
	const containers = ContainersHooksSelectors.selectContainers();

	const [containersInUse, setContainersInUse] = useState([]);
	const { getValues } = useFormContext();
	const forceUpdate = React.useCallback(() => {
		const values = getValues().uploads;
		setContainersInUse(values.map((val) => val.containerName));
	}, []);

	return (
		<MuiAutocomplete
			popupIcon={<ChevronIcon />}
			closeIcon={<ClearIcon />}
			openText=""
			closeText=""
			clearText=""
			handleHomeEndKeys
			value={value}
			onChange={(event, newValue: DestinationOption) => {
				if (!newValue) {
					setValue(emptyOption);
					setState('');
					onChange(emptyOption);
				} else {
					setValue(newValue);
					setState(!newValue._id.length ? 'new' : 'existing');
					onChange(newValue);
				}
			}}
			onOpen={forceUpdate}
			options={containers.map((val) => ({
				name: val.name,
				_id: val._id,
				latestRevision: val.latestRevision,
			}))}
			filterOptions={(options, params) => {
				const filtered: DestinationOption[] = filter(options, params);
				const { inputValue } = params;
				const isExisting = options.some((option: DestinationOption) => inputValue === option.name);
				if (inputValue !== '' && !isExisting) {
					filtered.unshift({
						_id: '',
						name: inputValue,
						latestRevision: '',
					});
				}

				(function hideSelectedOption() {
					const index = filtered.findIndex((x) => x.name === value.name);
					if (index > -1) {
						filtered.splice(index, 1);
					}
				}());

				return filtered;
			}}
			getOptionLabel={(option: DestinationOption) => option.name}
			renderInput={({ InputProps, ...params }) => (
				<TextInput
					error={!!errorMessage}
					state={state}
					{...params}
					{...props}
					InputProps={{ ...InputProps,
						startAdornment: !!errorMessage && (
							<ErrorIcon>
								{errorMessage}
							</ErrorIcon>
						),
					}}
				/>
			)}
			getOptionDisabled={(option: DestinationOption) => containersInUse.indexOf(option.name) > -1}
			renderOption={(option: DestinationOption) => {
				if (option.name && !option._id) return (<NewContainer {...option} />);
				return (
					<ExistingContainer
						inUse={containersInUse.indexOf(option.name) > -1}
						{...option}
					/>
				);
			}}
			disabled={disabled}
		/>
	);
};
