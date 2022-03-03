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
import styled from 'styled-components';
import { Tooltip as TooltipComponent, alpha } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

export const fadeToLeft = (color: string) => `
	background-image: linear-gradient(to left, ${color} 0%, ${alpha(color, 0.886)} 37.72%, ${alpha(color, 0)} 52.55%);
`;

export const Tooltip = TooltipComponent;
//  withStyles(() => ({
// 	tooltip: {
// 		maxWidth: 600,
// 	},
// 	tooltipPlacementBottom: {
// 		transform: 'translateX(25%) !important',
// 	},
// }))(TooltipComponent);

export const Container = styled.div`
	position: relative;
	overflow: hidden; 
	white-space: nowrap;
	display: block;
	flex-grow: 1;
	min-width: 0;
	height: 100%;
	text-overflow: ellipsis;

	&:hover {
		& > * {
			text-decoration: underline;
		}
	}
`;
