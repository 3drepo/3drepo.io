/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { Select as SelectBase, Tooltip as TooltipBase } from '@mui/material';
import styled from 'styled-components';

export const Select = styled(SelectBase)`
	&& {
		background: transparent;
		width: 100%;
		cursor: initial;
		pointer-events: none;
	}
`;

export const Tooltip = styled(TooltipBase).attrs({
	arrow: true,
	followCursor: true,
	componentsProps: {
		tooltip: {
			sx: {
				maxWidth: 230,
				top: 20,
			},
		},
	},
})``;
