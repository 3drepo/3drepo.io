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

import { AuthImg } from '@components/authenticatedResource/authImg.component';
import styled from 'styled-components';

export const ImageSizesRefContainer = styled(AuthImg)`
	max-height: calc(100vh - 210px);
	max-width: calc(100vw - 164px);
	z-index: -1;
	opacity: 0;
	position: absolute;
	object-fit: contain;

	img {
		height: 100%;
		width: 100%;
	}
`;

export const Container = styled.div<{ $cursor }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: relative;
	cursor: ${({ $cursor }) => $cursor};
	height: 100%;
`;

export const MarkupStageContainer = styled.div`
	border: solid 1px ${({ theme }) => theme.palette.primary.main};
	border-radius: 10px;
	overflow: hidden;
	margin: auto;
`;

export const MarkupToolbarContainer = styled.div`
	margin: 47px auto 20px;
`;
