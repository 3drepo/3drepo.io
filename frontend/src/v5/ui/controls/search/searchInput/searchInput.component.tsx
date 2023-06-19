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
import { trim } from 'lodash';
import { IconButton, TextField, StartAdornment, EndAdornment, SearchChip } from './searchInput.styles';
import { SearchContext } from '../searchContext';

type ISearchInput = {
	/**
	 * Callback when the clear button is clicked.
	 * Note: the clear button only appears when the controls is controlled (read more https://reactjs.org/docs/forms.html#controlled-components)
	 */
	onClear?: () => void;
	multiple?: boolean;
} & TextFieldProps;

export const SearchInput = ({ onClear, variant = 'filled', multiple, ...props }: ISearchInput): JSX.Element => {
	const { queries, setQueries } = useContext(SearchContext);
	const [value, setValue] = useState('');

	const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		setValue(event.currentTarget.value);
		props.onChange?.(event);
		if (multiple) return;
		setQueries([event.currentTarget.value]);
	};

	const onClickClear = () => {
		onClear?.();
		setQueries([]);
		setValue('');
	};

	const onKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			props.onSubmit?.(event);
			const trimmedValue = trim(value);
			if (!multiple || !trimmedValue) return;
			setQueries((prev) => prev.concat([trimmedValue]));
			setValue('');
		}
	};

	const removeQuery = (index) => setQueries((prev) => prev.filter((el, i) => index !== i));

	return (
		<TextField
			value={value}
			InputProps={{
				startAdornment: (
					<>
						<StartAdornment>
							<SearchIcon />
						</StartAdornment>
						{!!queries.length && multiple && queries.map((query, index) => (
							<SearchChip
								key={query}
								label={query}
								onDelete={() => removeQuery(index)}
							/>
						))}
					</>
				),
				endAdornment: (
					<EndAdornment $isVisible={Boolean(value)}>
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
