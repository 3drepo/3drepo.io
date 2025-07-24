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

import { TextFieldProps } from '@mui/material';
import SearchIcon from '@assets/icons/outlined/search-outlined.svg';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { ChangeEvent, useContext, type JSX } from 'react';
import { IconButton, TextField, StartAdornment, EndAdornment } from './searchInput.styles';
import { SearchContext } from '../searchContext';

type ISearchInput = {
	/**
	 * Callback when the clear button is clicked.
	 * Note: the clear button only appears when the controls is controlled (read more https://reactjs.org/docs/forms.html#controlled-components)
	 */
	onClear?: () => void;
} & TextFieldProps;

export const SearchInput = ({ onClear, value, variant = 'filled', ...props }: ISearchInput): JSX.Element => {
	const { query, setQuery } = useContext(SearchContext);

	const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		setQuery(event.currentTarget.value);
		props.onChange?.(event);
	};

	const onClickClear = () => {
		onClear?.();
		setQuery('');
	};

	const val = query || value || '';

	return (
		<TextField
			value={val}
			InputProps={{
				startAdornment: (
					<StartAdornment>
						<SearchIcon />
					</StartAdornment>
				),
				endAdornment: (
					<EndAdornment $isVisible={Boolean(val)}>
						<IconButton onClick={onClickClear} size="large">
							<CloseIcon />
						</IconButton>
					</EndAdornment>
				),
			}}
			variant={variant}
			{...props}
			onChange={onChange}
		/>
	);
};
