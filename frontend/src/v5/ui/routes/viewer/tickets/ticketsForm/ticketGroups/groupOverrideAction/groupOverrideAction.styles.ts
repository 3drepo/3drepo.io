/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { Checkbox as CheckboxBase, IconButton } from '@mui/material';
import styled from 'styled-components';
import HighlightIconBase from '@assets/icons/outlined/highlight-outlined.svg';


export const Checkbox = styled(CheckboxBase)`
	margin-left: auto;
	margin-right: 0;
`;

export const ActionButton = styled(IconButton)`
	margin-left: auto;
	margin-right: 0;
	padding: 9px;
	color: ${({ theme }) => theme.palette.secondary.main};

	&&:hover {
		background-color: transparent;
	}
`;

export const HighlightIcon = styled(HighlightIconBase)`
	color: inherit;
`;
