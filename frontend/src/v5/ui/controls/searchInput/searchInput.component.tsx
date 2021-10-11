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

import React, { Dispatch } from 'react';
import { TextFieldProps } from '@material-ui/core';
import SearchIcon from '@assets/icons/search.svg';
import CloseIcon from '@assets/icons/close_rounded.svg';
import { IconButton, TextField, StartAdornment, EndAdornment } from './searchInput.styles';

type ISearchInput = {
	onClear: Dispatch<void>;
} & TextFieldProps;

export const SearchInput = ({ onClear, value, ...props }: ISearchInput): JSX.Element => (
	<TextField
		value={value}
		InputProps={{
			startAdornment: (
				<StartAdornment>
					<SearchIcon />
				</StartAdornment>
			),
			endAdornment: (
				(
					<EndAdornment $isVisible={value}>
						<IconButton onClick={() => onClear()}>
							<CloseIcon />
						</IconButton>
					</EndAdornment>
				)
			),
		}}
		{...props}
	/>
);
