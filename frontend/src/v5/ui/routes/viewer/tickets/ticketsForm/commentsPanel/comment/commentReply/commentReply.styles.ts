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
import { ImageWithExtraCount as CommentImageBase } from '@controls/imageWithExtraCount/imageWithExtraCount.component';
import CameraIconBase from '@assets/icons/outlined/camera-outlined.svg';
import { CommentMarkDown as CommentMarkDownBase } from '../commentMarkDown/commentMarkDown.component';

export const CommentMarkDown = styled(CommentMarkDownBase)`
	display: inline;
`;

export const CameraIcon = styled(CameraIconBase)`
	margin-right: 5px;
	margin-bottom: -1px;
`;

export const OriginalMessage = styled.div`
	display: inline-block;
`;

export const CommentImage = styled(CommentImageBase)`
	min-width: 67px;
	height: 67px;
`;
