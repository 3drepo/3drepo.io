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

import { Typography } from '@controls/typography';
import styled from 'styled-components';

export const DropZone = styled.div`
;
	width: 100%;
	height: 100%;

	border: 2px dashed ${({ theme }) => theme.palette.primary.main};
	border-radius: 10px;
	background: ${({ theme }) => theme.palette.primary.contrast};
	user-select: none;

	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;

export const HelpText = styled(Typography).attrs({
	variant: 'h5',
})`
	color: ${({ theme }) => theme.palette.base.main};
`;
