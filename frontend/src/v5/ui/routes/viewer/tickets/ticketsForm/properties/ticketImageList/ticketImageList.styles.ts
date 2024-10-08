/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { OverlappingContainer } from '@controls/overlappingContainer/overlappingContainer.styles';
import styled from 'styled-components';

export const ImagesContainer = styled.div`
	border-radius: 5px;
	overflow: hidden;
	aspect-ratio: 1 / 1;

	${OverlappingContainer} {
		height: 100%;
	}

	img {
		width: 100%;
		border-radius: 5px;
		object-fit: cover;
		aspect-ratio: 1 / 1;
	}
`;

export const ImagesGridContainer = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	border-radius: 9px;
	padding: 5px;
	box-sizing: border-box;
	display: grid;
	grid-template: 1fr 1fr / 1fr 1fr;
	width: 100%;
	gap: 5px;

	& > * {
		aspect-ratio: 1 / 1;
	}
`;

export const Content = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 11px;

	& > * {
		width: 50%;
	}
`;

export const Actions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
`;
