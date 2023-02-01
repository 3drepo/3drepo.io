/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import styled from 'styled-components';

import IconButton from '@mui/material/IconButton';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg'

export const Container = styled.div``;

export const StyledIconButton = styled(IconButton)`
	&& {
		padding: 6px;
	}
`;

export const SkipPreviousIconV5 = styled(ChevronIcon)`
	transform: rotate(90deg);
	width: 14px;
	height: 14px;
`;

export const SkipNextIconV5 = styled(ChevronIcon)`
	transform: rotate(-90deg);
	width: 14px;
	height: 14px;
`;
