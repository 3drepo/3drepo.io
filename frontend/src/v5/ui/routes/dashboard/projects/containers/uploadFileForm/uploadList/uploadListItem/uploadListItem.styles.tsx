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

import styled, { css } from 'styled-components';
import { CircleButton } from '@controls/circleButton';
import { UploadListItemRevisionTag } from './components/uploadListItemRevisionTag';
import { UploadListItemDestination } from './components/uploadListItemDestination';

export const Button = styled(CircleButton)<{ $selectedrow: boolean; onClick: () => void; }>`
	margin: 0;
	&&&&& {
		:hover, &.Mui-focusVisible { 
			box-shadow: none;
			background-color: ${({ $selectedrow, theme }) => ($selectedrow ? theme.palette.secondary.light : theme.palette.tertiary.lightest)}
		}
	}
	&& {
		background-color: transparent;
		color: ${({ $selectedrow, theme }) => ($selectedrow ? theme.palette.primary.contrast : theme.palette.secondary.main)}
	}
`;

const DestinationAndTagDimensions = css`
	width: 340px;
	height: 35px;
	min-width: 80px;
`;

export const Destination = styled(UploadListItemDestination)`
	${DestinationAndTagDimensions}
`;

export const RevisionTag = styled(UploadListItemRevisionTag)`
	${DestinationAndTagDimensions}
`;
