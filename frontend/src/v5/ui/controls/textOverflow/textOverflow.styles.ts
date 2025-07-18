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
import styled, { css } from 'styled-components';
import { Tooltip as TooltipComponent } from '@mui/material';

export const Tooltip = styled(TooltipComponent)`
	max-width: 600px;
`;

export const Container = styled.div<{ lines: number }>`
	position: relative;
	overflow: hidden;
	white-space: nowrap;
	display: block;
	flex-grow: 1;
	min-width: 0;
	height: 100%;
	text-overflow: ellipsis;
	
	${({ lines }) => lines > 1 && css`
		max-height: ${1.1 * lines}em;
		@supports (-webkit-line-clamp: ${lines}) {
			white-space: normal;
			display: -webkit-box;
			-webkit-line-clamp: ${lines};
			-webkit-box-orient: vertical;
		}
	`}
`;
