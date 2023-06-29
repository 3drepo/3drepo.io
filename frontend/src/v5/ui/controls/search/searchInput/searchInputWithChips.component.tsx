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
import { useContext } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { TextField, StartAdornment, SearchChip, Autocomplete } from './searchInput.styles';
import { SearchContext } from '../searchContext';

type ISearchInputWithChips = {
	variant?: 'filled' | 'outlined',
	onRemoveChip?: (index: number) => void,
	placeholder?: string,
} & Partial<AutocompleteProps<TextFieldProps, boolean, undefined, undefined, typeof SearchChip>>;

export const SearchInputWithChips = ({ variant = 'filled', placeholder, onRemoveChip, ...props }: ISearchInputWithChips): JSX.Element => {
	const { query, setQuery } = useContext(SearchContext);
	const queries: string[] = query ? JSON.parse(query) : [];

	const onChange = (e, newValue) => setQuery(JSON.stringify(newValue));

	const removeQuery = (index) => {
		onRemoveChip?.(index);
		setQuery(JSON.stringify(queries.filter((el, i) => index !== i)));
	};

	return (
		<Autocomplete
			value={queries}
			open={false}
			freeSolo
			multiple
			options={[]}
			clearIcon={<CloseIcon />}
			getOptionLabel={(labelObject) => labelObject[0] ?? ''} // This silences a console error
			renderTags={(
				values: any[],
			) => values.map((value: any, index: number) => (
				<SearchChip
					key={value}
					label={value}
					onDelete={() => removeQuery(index)}
				/>
			))}
			onChange={onChange}
			{...props}
			renderInput={(params: any) => (
				<TextField
					variant={variant}
					placeholder={placeholder || formatMessage({ id: 'searchInput.defaultPlaceholder', defaultMessage: 'Search...' })}
					{...params}
					InputProps={{
						...params.InputProps,
						startAdornment: (
							// Mui Autocomplete sets the startAdornment to be the query chips
							// therefore this is required to prevent the search icon and chips overwriting eachother
							<>
								<StartAdornment>
									<SearchIcon />
								</StartAdornment>
								{params?.InputProps?.startAdornment}
							</>
						),
					}}
				/>
			)}
		/>
	);
};
