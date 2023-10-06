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

import styled from 'styled-components';
import { Avatar } from '@mui/material';

const EXTENSION_COLOUR_MAP = {
	ifc: '#A8007A',
	bim: '#80E0E9',
	dgn: '#62BB46',
	rvt: '#186BFE',
	rfa: '#186BFE',
	spm: '#62BB46',
	dwg: '#E51050',
	dxf: '#1D1D1B',
	nwd: '#007628',
	nwc: '#007628',
};
const ICON_SIZE = 35;

export const StyledIconButton = styled(Avatar)<{ extension: string }>`
	font-weight: 600;
	font-size: 14px;
	margin: 0 7px;
	width: ${ICON_SIZE}px;
	height: ${ICON_SIZE}px;
	box-sizing: border-box;
	text-transform: uppercase;

	color: ${({ extension, theme }) => EXTENSION_COLOUR_MAP[extension] || theme.palette.tertiary.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
`;
