/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { COLOR } from '../../../../../../../styles';
import { Image as ImageComponent } from '../../../../../image';
import { UserIndicator } from '../userMarker/userMarker.styles';
import { Reference } from './ticketReference/ticketReference.styles';

export const Blockquote = styled.blockquote`
	color: ${COLOR.BLACK_40};
	border-left: 3px solid ${COLOR.BLACK_40};
	margin-left: 0;
	margin-right: 20px;
	margin-top: 8px;
	margin-bottom: 14px;
	padding-left: 10px;

	a, ${Reference} {
		pointer-events: none;
		cursor: default;
		color: inherit;
		text-decoration: none;
	}

	${UserIndicator} {
		color: inherit;
		pointer-events: none;
	}
`;

export const Paragraph = styled.p`
	& + & {
		margin-top: 14px;
	}
`;

export const Image = styled(ImageComponent)`
	max-width: 100%;
	width: 100%;
	max-height: 100px;
	height: auto;

	img {
		display: block;
		max-width: 100%;
		width: 100%;
		max-height: 100px;
		height: auto;
		margin: auto;
	}
`;
