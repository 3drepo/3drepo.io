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
import { createElement } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import styled from 'styled-components';

export const RadioContainer = styled(Grid)`
	&& {
		width: 100%;
	}
`;

export const TableHeadingRadioButton = styled(Radio)`
	&& {
		height: 40px;
		width: 40px;
		box-sizing: border-box;
	}
`;

export const TableHeadingRadioTooltip = styled(({className, ...rest}: TooltipProps) =>
	createElement(Tooltip, {classes: { popper: className }, ...rest })
)``;

