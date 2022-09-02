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

import { useCallback, useState } from 'react';
import { IContainer } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { useFormContext } from 'react-hook-form';
import { canUploadToBackend, prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { formatMessage } from '@/v5/services/intl';
import { ErrorTooltip } from '@controls/errorTooltip';
import { createFilterOptions } from '@mui/material';
import { Autocomplete, DestinationInput } from './uploadListItemDestination.styles';
import { NewContainer } from './options/newContainer/newContainer.component';
import { UnavailableContainer } from './options/unavailableContainer/unavailableContainer.component';
import { ExistingContainer } from './options/existingContainer/existingContainer.component';
import { OptionsBox } from './options';

interface IUploadListItemDestination {
	onChange: (option) => void;
	control?: any;
	errors?: any;
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
const filter = createFilterOptions<IContainer>({ trim: true });

export const UploadListItemDestination = ({
	control,
	errors,
	disabled = false,
	className,
	onChange,
	defaultValue,
	...props
}: IUploadListItemDestination): JSX.Element => {
	const [value, setValue] = useState<IContainer>({ ...emptyOption, name: defaultValue });
	const [disableClearable, setDisableClearable] = useState(!value.name);
	const containers = ContainersHooksSelectors.selectContainers();
	const processingContainers = containers.filter((container) => !canUploadToBackend(container.status));
	const [newOrExisting, setNewOrExisting] = useState(() => {
		if (value.name) {
			return containers.find((c) => c.name === value.name) ? 'existing' : 'new';
		}
		return '';
	});
	const [containersInUse, setContainersInUse] = useState(processingContainers);
	const { getValues } = useFormContext();
	const forceUpdate = useCallback(() => {
		const containerIdsInModal = getValues().uploads.map((upload) => upload.containerId).filter(Boolean);
		if (containerIdsInModal) {
			const containersInModal = containerIdsInModal.map((idInUse) => containers
				.find((cont) => cont._id === idInUse));
			setContainersInUse([...processingContainers, ...containersInModal]);
		}
	}, []);

	const errorMessage = errors.containerName?.message;

	const onAutocompleteChange = (_, newValue: IContainer) => {
		setValue(newValue || emptyOption);
		onChange(newValue || emptyOption);
		if (!newValue) {
			setNewOrExisting('');
			forceUpdate();
		} else {
			setNewOrExisting(!newValue._id ? 'new' : 'existing');
		}
		setDisableClearable(!newValue);
	};

	const onAutocompleteInputChange = (_, name: string) => {
		if (name === value.name) onChange(value);
	};

	const getFilterOptions = (options: IContainer[], params) => {
		let filtered: IContainer[] = filter(options, params);
		const { inputValue } = params;

		const isExisting = options.some((option: IContainer) => inputValue === option.name);
		filtered = filtered.filter((x) => x.name !== value.name);
		if (containersInUse.length === containers.length && !inputValue) {
			filtered = [];
		}
		if (inputValue !== '' && !isExisting) {
			filtered = [{
				...emptyOption,
				name: inputValue,
			}, ...filtered];
		}

		return filtered;
	};

	const optionIsUsed = ({ name }: IContainer) => containersInUse.some((c) => c.name === name);

	const getOptionDisabled = (option: IContainer) => !!option.name && optionIsUsed(option);

	const getRenderOption = (optionProps, option: IContainer) => {
		if (option._id) {
			return (
				<ExistingContainer
					inUse={optionIsUsed(option)}
					container={option}
					latestRevision={option.latestRevision}
					{...optionProps}
				/>
			);
		}

		if (errorMessage) return (<UnavailableContainer />);

		if (!containers.some((c) => c.name === option.name.trim())) {
			return (<NewContainer containerName={option.name} {...optionProps} />);
		}

		return (<></>);
	};

	return (
		<Autocomplete
			value={value}
			disableClearable={disableClearable}
			onChange={onAutocompleteChange}
			onInputChange={onAutocompleteInputChange}
			onOpen={forceUpdate}
			options={containers}
			filterOptions={getFilterOptions}
			getOptionLabel={(option: IContainer) => option.name}
			renderInput={({ InputProps, ...params }) => (
				<DestinationInput
					control={control}
					formError={errors.containerName}
					name="containerName"
					neworexisting={newOrExisting}
					{...params}
					{...props}
					InputProps={{
						...InputProps,
						startAdornment: !!errorMessage && (<ErrorTooltip>{errorMessage}</ErrorTooltip>),
					}}
				/>
			)}
			getOptionDisabled={getOptionDisabled}
			renderOption={getRenderOption}
			ListboxComponent={OptionsBox}
			noOptionsText={formatMessage({
				id: 'uploads.destination.noOptions',
				defaultMessage: 'Start typing to create a new Container.',
			})}
			className={className}
			disabled={disabled}
		/>
	);
};
