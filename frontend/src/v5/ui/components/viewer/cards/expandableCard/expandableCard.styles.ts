/**
 *  Copyright (C) 2026 3D Repo Ltd
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
import { CARD_WIDTH } from '../card.styles';

export const TRANSITION_DURATION = 400;
export const ExpandableCardContainer = styled.div<{ $isExpanded: boolean }>`
	height: 100%;
	display: flex;
	flex-direction: row;
	overflow: hidden;
	transition: width ${TRANSITION_DURATION}ms ease-in-out;
	width: ${({ $isExpanded }) => $isExpanded ? `${CARD_WIDTH * 2}px` : `${CARD_WIDTH}px`};

	> * {
		width: ${CARD_WIDTH}px;
		flex-shrink: 0;
	}
`;

export const MainColumn = styled.div`
	overflow-y: overlay;
`;
