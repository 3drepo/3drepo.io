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

import styled from 'styled-components';
import { Backdrop } from '@mui/material';

export const Container = styled(Backdrop).attrs({ open: true })`
	cursor: grabbing;
	z-index: 1000;
	pointer-events: all;
	display: block;
`;

export const Areas = styled.div`
	width: fit-content;
	height: 100%;
`;

export const Area = styled.div<{ $width: number }>`
	width: ${({ $width }) => $width}px;
	height: 100%;
	display: inline-block;
`;