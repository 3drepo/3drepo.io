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

import { AutocompleteProps, TextFieldProps } from '@mui/material';
import SearchIcon from '@assets/icons/outlined/search-outlined.svg';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { ChangeEvent, useContext } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { TextField, StartAdornment, SearchChip, Autocomplete } from './searchInput.styles';
import { SearchContext } from '../searchContext';

type ISearchInput = {
	variant?: 'filled' | 'outlined',
	placeholder?: string,
} & Partial<AutocompleteProps<TextFieldProps, boolean, undefined, undefined, typeof SearchChip>>;

export const SearchInput = ({ variant = 'filled', multiple, placeholder, ...props }: ISearchInput): JSX.Element => {
	const { queries, setQueries } = useContext(SearchContext);

	const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, newValue) => {
		// This is for when enter is pressed and the chips change
		if (!multiple) return;
		setQueries(newValue);
	};

	const onInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, newValue) => {
		// This is for when the textfield value changes by typing
		if (multiple) return;
		setQueries([newValue]);
	};

	const removeQuery = (index) => setQueries((prev) => prev.filter((el, i) => index !== i));

	return (
		<Autocomplete
			value={queries}
			open={false}
			freeSolo
			multiple={multiple}
			options={[]}
			clearIcon={<CloseIcon />}
			renderTags={(
				valueFoo: any[],
			) => valueFoo.map((query: any, index: number) => (
				<SearchChip
					key={query}
					label={query}
					onDelete={() => removeQuery(index)}
				/>
			))}
			onChange={onChange}
			onInputChange={onInputChange}
			{...props}
			renderInput={(params: any) => (
				<TextField
					variant={variant}
					multiline={multiple}
					placeholder={placeholder || formatMessage({ id: 'searchInput.defaultPlaceholder', defaultMessage: 'Search...' })}
					{...params}
					InputProps={{
						...params.InputProps,
						startAdornment: (
							<>
								<StartAdornment>
									<SearchIcon />
								</StartAdornment>
									{...(params?.InputProps?.startAdornment || [])}
							</>
						),
					}}
				/>
			)}
		/>
	);
};
