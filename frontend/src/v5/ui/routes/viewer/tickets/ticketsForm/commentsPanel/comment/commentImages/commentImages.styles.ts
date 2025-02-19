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

export const FlexContainer = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	gap: 5px;

	& > * {
		flex: 1;
	}

	& ~ & {
		margin-top: 5px;
	}
`;

export const CommentImage = styled(CommentImageBase).attrs({
	variant: 'secondary',
})``;


export const SingleImage = styled(CommentImage)`
	width: 236px;
	margin: -10px 0 10px -12px;
	border-radius: inherit;
	border-bottom-right-radius: 0;
	border-bottom-left-radius: 0;
	cursor: pointer;

	&:is(span) {
		padding-top: 100%;
	}
`;

export const MultiImagesContainer = styled.div`
	width: 231px;
	margin-top: -5px;
	margin-left: -7px;
	margin-bottom: 3px;
`;
