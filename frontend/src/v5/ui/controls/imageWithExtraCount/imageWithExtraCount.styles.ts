/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { OverlappingContainer as OverlappingContainerBase } from '@controls/overlappingContainer/overlappingContainer.styles';
import { ImageWithSkeleton } from '@controls/imageWithSkeleton/imageWithSkeleton.component';
import { hexToOpacity } from '@/v5/helpers/colors.helper';

export const OverlappingContainer = styled(OverlappingContainerBase)`
	border-radius: 5px;
	overflow: hidden;
`;

export const Image = styled(ImageWithSkeleton)`
	object-fit: cover;
	aspect-ratio: 1 / 1;
	cursor: pointer;
	border-radius: 5px;
	overflow: hidden;
`;

export const ExtraImages = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	${({ theme }) => theme.typography.h2}
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${({ theme }) => hexToOpacity(theme.palette.secondary.main, 60)};
`;
