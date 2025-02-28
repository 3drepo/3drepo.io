/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { PopoverCircle } from '@components/shared/popoverCircles/popoverCircle.component';
import styled from 'styled-components';

export const AddUserButton = styled(PopoverCircle).attrs({
	size: 'small',
})`
	padding: 5px;
	box-sizing: border-box;
	color: ${({ theme }) => theme.palette.base.main};

	&& {
		border: 1px dashed ${({ theme }) => theme.palette.base.light};
		outline: none;
		margin: 0;
	}
`;