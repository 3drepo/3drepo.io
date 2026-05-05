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

import { COLOR } from '@/v4/styles';
import { MenuItem } from '@mui/material';
import styled from 'styled-components';

export const ViewpointItem = styled(MenuItem)<{ active?: boolean }>`
	padding: 8px;
	background-color: ${({ active }) => active ? `${COLOR.BLACK_6}` : 'initial'};
	border-bottom: 1px solid ${COLOR.BLACK_20};
	box-sizing: border-box;
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	overflow: hidden;

	${({ active }) => `
		padding: ${active ? '12px 15px' : '12px 40px 12px 15px'};
	`}
` as any;
