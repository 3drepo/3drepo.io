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
import ViewpointIconBase from '@assets/icons/outlined/camera_side-outlined.svg';
import { CentredContainer } from '@controls/centredContainer';
import ImageIconBase from '@assets/icons/outlined/image_thin-outlined.svg';
import { AuthImg } from '@components/authenticatedResource/authImg.component';

export const ThumbnailContainer = styled(OverlappingContainer)`
	height: 50px;
	width: 50px;
	min-width: 50px;
	box-sizing: border-box;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-radius: 5px;
	overflow: hidden;
	margin-bottom: 6px;
`;

export const Thumbnail = styled(AuthImg)`
	object-fit: cover;
	user-select: none;
`;

export const ImagePlaceholder = styled(CentredContainer)`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	color: ${({ theme }) => theme.palette.base.lighter};
`;

export const ImageIcon = styled(ImageIconBase)`
	display: block;
`;

export const ViewpointOverlay = styled.div`
	position: absolute;
	top: calc(100% - 16px);
	left: calc(100% - 18px);
	height: 16px;
	width: 18px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	opacity: 0.5;
	border-radius: 5px 0 0;
`;

export const ViewpointIcon = styled(ViewpointIconBase)`
	color: ${({ theme }) => theme.palette.base.main};
	margin: 2px 2px 1px 3px;
`;
