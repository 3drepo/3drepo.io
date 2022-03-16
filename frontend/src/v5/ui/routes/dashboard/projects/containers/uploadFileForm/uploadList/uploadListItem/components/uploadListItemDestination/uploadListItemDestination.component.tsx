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

import React, { useState } from 'react';
import MuiAutocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { DestinationOption, UploadItemFields } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { Control, useFormContext } from 'react-hook-form';
import { ErrorTooltip } from '@controls/errorTooltip';
import { TextInput } from './uploadListItemDestination.styles';
import { NewContainer } from './options/newContainer';
import { ExistingContainer } from './options/existingContainer';

interface IUploadListItemDestination {
	control: Control<UploadItemFields>;
	onChange: (option) => void;
	errorMessage: string;
	disabled?: boolean;
	className?: string;
}

const emptyOption = {
	containerId: '',
	containerName: '',
	latestRevision: '',
};
const filter = createFilterOptions<DestinationOption>();

export const UploadListItemDestination: React.FC<IUploadListItemDestination> = ({
	control,
	errorMessage,
	disabled = false,
	className,
	onChange,
	...props
}) => {
	const [value, setValue] = useState<DestinationOption>(emptyOption);
	const [newOrExisting, setNewOrExisting] = useState('unset');
	const containers = ContainersHooksSelectors.selectContainers();

	const [containersInUse, setContainersInUse] = useState([]);
	const { getValues } = useFormContext();
	const forceUpdate = React.useCallback(() => {
		const values = getValues().uploads;
		setContainersInUse(values.map((val) => val.containerName));
	}, []);

	return (
		<MuiAutocomplete
			value={value}
			onChange={async (event, newValue: DestinationOption) => {
				if (!newValue) {
					setValue(emptyOption);
					setNewOrExisting('unset');
					onChange(emptyOption);
				} else {
					setValue(newValue);
					setNewOrExisting(!newValue.containerId.length ? 'new' : 'existing');
					onChange(newValue);
				}
			}}
			onOpen={forceUpdate}
			options={containers.map((val) => ({
				containerId: val._id,
				containerName: val.name,
				containerUnit: val.unit,
				containerType: val.type,
				containerDesc: val.desc,
				containerCode: val.code,
				latestRevision: val.latestRevision,
			}))}
			filterOptions={(options: DestinationOption[], params) => {
				let filtered: DestinationOption[] = filter(options, params);
				const { inputValue } = params;
				const isExisting = options.some((option: DestinationOption) => inputValue === option.containerName);
				if (inputValue !== '' && !isExisting) {
					filtered = [{
						containerId: '',
						containerName: inputValue,
						latestRevision: '',
					}, ...filtered];
				}

				filtered = filtered.filter((x) => x.containerName !== value.containerName);

				return filtered;
			}}
			getOptionLabel={(option: DestinationOption) => option.containerName}
			renderInput={({ InputProps, ...params }) => (
				<TextInput
					name="containerName"
					control={control}
					neworexisting={!errorMessage && newOrExisting}
					formError={errorMessage}
					{...params}
					{...props}
					InputProps={{ ...InputProps,
						startAdornment: !!errorMessage && (
							<ErrorTooltip>
								{errorMessage}
							</ErrorTooltip>
						),
					}}
				/>
			)}
			getOptionDisabled={(option: DestinationOption) => containersInUse.includes(option.containerName)}
			renderOption={(option: DestinationOption) => (option.containerName && !option.containerId
				? <NewContainer containerName={option.containerName} />
				: (
					<ExistingContainer
						inUse={containersInUse.includes(option.containerName)}
						containerName={option.containerName}
						latestRevision={option.latestRevision}
					/>
				))}
			disabled={disabled}
		/>
	);
};
