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

import { Select } from '@controls/inputs/select/select.component';
import styled from 'styled-components';

export const IconWrapper = styled.span<{ color: string; }>`
	margin: 0 8px 0 0;
	display: flex;
	svg {
		height: 11px;
		width: 11px;
		color: ${({ color }) => color};
	}
`;

export const HiddenSelect = styled(Select)`
	height: 0;
	width: 0;
	overflow: hidden;
`;
