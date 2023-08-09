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
import { Display } from '@/v5/ui/themes/media';

export const CircledNumber = styled.span`
	width: 24px;
	height: 24px;
	background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	color: ${({ theme }) => theme.palette.secondary.main};
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
	font-size: 11px;
`;

export const Container = styled.div`
	margin: 16px 0;
`;

export const CollapseSideElementGroup = styled.div`
	display: flex;
	align-items: center;

	& > :last-child {
		margin-right: 0;
	}

	.MuiTextField-root {
		width: 405px;

		@media (max-width: ${Display.Tablet}px) {
			width: 225px;
			padding-left: 25px;
			box-sizing: border-box;
		}
	}
`;
