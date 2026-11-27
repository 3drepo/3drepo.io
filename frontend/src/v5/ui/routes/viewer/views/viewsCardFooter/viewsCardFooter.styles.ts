/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { Grid } from '@mui/material';
import styled from 'styled-components';

interface IViewerPanelFooter {
	padding?: string;
}

export const ViewerPanelFooter = styled(Grid).attrs({
	direction: 'row',
	container: true,
	wrap: 'nowrap',
})<IViewerPanelFooter>`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	padding: ${({ padding }) => padding || '0 16px' };
	border-top: 1px solid ${({ theme }) => theme.palette.base.lightest};
	flex: none;
	min-height: 65px;
	font-size: 14px;
	z-index: 1;
`;
