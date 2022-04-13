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
import { Tooltip as TooltipComponent } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

export const Container = styled.div`
	display: inline-block;
`;

export const Tooltip = withStyles((theme: any) => ({
	popper: {
		width: 180,
	},
	tooltip: {
		backgroundColor: theme.palette.primary.contrast,
		color: theme.palette.error.main,
		fontSize: theme.typography.pxToRem(12),
		boxShadow: theme.palette.shadows.level_5,
		border: 'none',
		borderRadius: 5,
		padding: '15px 15px 17px 15px',
	},
	tooltipPlacementRight: {
		margin: '-17px 0px 0 -1px',
	},
}))(TooltipComponent);

export const IconWrapper = styled.div`
	height: max-content;
	width: max-content;
	margin-left: 6px;

	svg {
		transform: translateY(20%);
	}
`;
