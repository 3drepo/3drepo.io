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

import React from 'react';
import ChevronIcon from '@assets/icons/chevron.svg';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import { ErrorTooltip } from '@controls/errorTooltip';
import { FormattedMessage } from 'react-intl';
import { DestinationOption } from '@/v5/store/containers/containers.types';
import { Input, TextInput, LastRevision, ContainerName, NewContainer, ExistingContainer } from './autocomplete.styles';

interface IAutocomplete {
	list: any[];
	filter: (opts, params) => DestinationOption[];
	onChange: (option) => void;
	errorMessage: string;
	disabled?: boolean;
	className?: string;
}

const emptyOption = { name: '', _id: '', latestRevision: '' };

export const Autocomplete: React.FC<IAutocomplete> = ({
	list,
	errorMessage,
	filter,
	disabled = false,
	className,
	onChange,
	...props
}) => {
	const [value, setValue] = React.useState(emptyOption);
	const [state, setState] = React.useState(errorMessage ? 'error' : 'empty');
	return (
		<Input
			state={state}
			popupIcon={<ChevronIcon />}
			openText=""
			closeText=""
			clearText=""
			handleHomeEndKeys
			value={value}
			onChange={(event, newValue) => {
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
			options={list.map((val) => ({
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
							<ErrorTooltip>
								{errorMessage}
							</ErrorTooltip>
						),
					}}
				/>
			)}
			renderOption={(option: DestinationOption) => {
				if (option.name && !option._id) {
					return (
						<NewContainer>
							<AddCircleIcon />
							<ContainerName>
								<FormattedMessage
									id="placeholder"
									defaultMessage="Add <Bold>{containerName}</Bold> as a new container"
									values={{
										Bold: (val: string) => <b>{val}</b>,
										containerName: option.name,
									}}
								/>
							</ContainerName>
						</NewContainer>
					);
				}
				return (
					<ExistingContainer>
						<ContainerName>
							{option.name}
						</ContainerName>
						<LastRevision>
							Last revision: {option.latestRevision || 'none'}
						</LastRevision>
					</ExistingContainer>
				);
			}}
			disabled={disabled}
		/>
	);
};
