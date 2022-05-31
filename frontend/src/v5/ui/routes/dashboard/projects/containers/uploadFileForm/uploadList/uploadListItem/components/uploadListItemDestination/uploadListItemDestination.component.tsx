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
import { IContainer } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { useFormContext } from 'react-hook-form';
import { canUploadToBackend, prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { formatMessage } from '@/v5/services/intl';
import { ErrorTooltip } from '@controls/errorTooltip';
import { Autocomplete, createFilterOptions } from '@mui/material';
import { DestinationInput } from './uploadListItemDestination.styles';
import { NewContainer } from './options/newContainer';
import { ExistingContainer } from './options/existingContainer';
import { OptionsBox } from './options';

interface IUploadListItemDestination {
	onChange: (option) => void;
	errorMessage: string;
	disabled?: boolean;
	className?: string;
	defaultValue: string;
}

const emptyOption = prepareSingleContainerData({
	_id: '',
	name: '',
	role: '',
	isFavourite: false,
});
const filter = createFilterOptions<IContainer>();

export const UploadListItemDestination: React.FC<IUploadListItemDestination> = ({
	errorMessage,
	disabled = false,
	className,
	onChange,
	defaultValue,
	...props
}) => {
	const [value, setValue] = useState<IContainer>({ ...emptyOption, name: defaultValue });
	const [disableClearable, setDisableClearable] = useState(true);
	const containers = ContainersHooksSelectors.selectContainers();
	const processingContainers = containers
		.filter((container) => !canUploadToBackend(container.status));
	const [newOrExisting, setNewOrExisting] = useState(() => {
		if (value.name) {
			return containers.find((c) => c.name === value.name) ? 'existing' : 'new';
		}
		return 'unset';
	});

	const [containersInUse, setContainersInUse] = useState(processingContainers);
	const { getValues } = useFormContext();
	const forceUpdate = React.useCallback(() => {
		const containerIdsInModal = getValues().uploads.map((upload) => upload.containerId).filter(Boolean);
		if (containerIdsInModal) {
			const containersInModal = containerIdsInModal.map((idInUse) => containers
				.find((cont) => cont._id === idInUse));
			setContainersInUse([...processingContainers, ...containersInModal]);
		}
	}, []);

	return (
		<Autocomplete
			value={value}
			disableClearable={disableClearable}
			onChange={async (event, newValue: IContainer) => {
				if (!newValue) {
					setValue(emptyOption);
					setNewOrExisting('unset');
					onChange(emptyOption);
				} else {
					setValue(newValue);
					setNewOrExisting(!newValue._id.length ? 'new' : 'existing');
					onChange(newValue);
				}
				setDisableClearable(!newValue);
			}}
			onOpen={forceUpdate}
			options={containers}
			filterOptions={(options: IContainer[], params) => {
				let filtered: IContainer[] = filter(options, params);
				const { inputValue } = params;

				setDisableClearable(!(value.name || inputValue));
				const isExisting = options.some((option: IContainer) => inputValue === option.name);
				filtered = filtered.filter((x) => x.name !== value.name);
				if (inputValue !== '' && !isExisting) {
					filtered = [{
						...emptyOption,
						name: inputValue,
					}, ...filtered];
				}

				return filtered;
			}}
			getOptionLabel={(option: IContainer) => option.name}
			renderInput={({ InputProps, ...params }) => (
				<DestinationInput
					neworexisting={newOrExisting}
					error={!!errorMessage}
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
			getOptionDisabled={(option: IContainer) => !!option.name
				&& containersInUse.some((c) => c.name === option.name)}
			renderOption={(optionProps, option) => (!option._id
				? <NewContainer containerName={option.name} {...optionProps} />
				: (
					<ExistingContainer
						inUse={containersInUse.some((c) => c.name === option.name)}
						container={option}
						latestRevision={option.latestRevision}
						{...optionProps}
					/>
				))}
			ListboxComponent={(listboxProps) => <OptionsBox {...listboxProps} />}
			noOptionsText={formatMessage({
				id: 'uploads.destination.noOptions',
				defaultMessage: 'The project has no containers. Start typing to create one.',
			})}
			className={className}
			disabled={disabled}
		/>
	);
};
