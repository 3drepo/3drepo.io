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

import { CentredContainer } from '@controls/centredContainer';
import ImageIconBase from '@assets/icons/outlined/image_thin-outlined.svg';
import { AuthImg } from '@components/authenticatedResource/authImg.component';
import styled from 'styled-components';

export const Image = styled(AuthImg)`
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