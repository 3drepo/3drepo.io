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
import { ChangeEvent, useContext, useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';
import { IconButton, TextField, StartAdornment, EndAdornment } from './searchInput.styles';
import { SearchContext } from '../searchContext';

type ISearchInput = {
	/**
	 * Callback when the clear button is clicked.
	 * Note: the clear button only appears when the controls is controlled (read more https://reactjs.org/docs/forms.html#controlled-components)
	 */
	onClear?: () => void;
	multiple?: boolean;
} & TextFieldProps;

export const SearchInput = ({ onClear, value, variant = 'filled', multiple, ...props }: ISearchInput): JSX.Element => {
	const { queries, setQueries } = useContext(SearchContext);
	const [val, setVal] = useState('');

	const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		setVal(event.currentTarget.value);
		props.onChange?.(event);
		if (multiple) return;
		setQueries([event.currentTarget.value]);
	};

	const onClickClear = () => {
		onClear?.();
		setQueries([]);
		setVal('');
	};

	const onKeyDown = (event) => {
		if (event.key === 'Enter') {
			props.onSubmit?.(event);
			if (!multiple) return;
			event.preventDefault();
			setQueries((prev: string[]) => prev.concat([val]));
			setVal('');
		}
	};

	return (
		<TextField
			value={val}
			InputProps={{
				startAdornment: (
					<>
						<StartAdornment>
							<SearchIcon />
						</StartAdornment>
						{!!queries.length && multiple && queries.map((query) => (
							<FilterChip
								key={query}
								label={query}
							/>
						))}
					</>
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
			placeholder={formatMessage({ id: 'searchInput.defaultPlaceholder', defaultMessage: 'Search...' })}
			onKeyDown={onKeyDown}
			multiline={multiple}
			{...props}
			onChange={onChange}
		/>
	);
};
