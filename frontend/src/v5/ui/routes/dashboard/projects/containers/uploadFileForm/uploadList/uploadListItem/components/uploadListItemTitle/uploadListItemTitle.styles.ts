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
import { Typography } from '@controls/typography';

export const Container = styled.div`
	width: fit-content;
	min-width: 120px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	user-select: none;
`;

export const Filename = styled(Typography).attrs({
	variant: 'h3',
})<{ '$selectedrow': boolean }>`
	width: fit-content;
	max-width: 100%;
	color: ${({ $selectedrow, theme }) => ($selectedrow ? theme.palette.primary.contrast : theme.palette.secondary.main)};
	height: 21px;

	white-space: nowrap;
	user-select: none;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const Filesize = styled(Typography).attrs({
	variant: 'h5',
	component: 'div',
})`
	color: ${({ theme }) => theme.palette.base.main};
`;
