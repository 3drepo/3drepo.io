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

export const ExpandableCardContainer = styled.div<{ $isExpanded: boolean }>`
	display: grid;
	grid-template-columns: ${({ $isExpanded }) => ($isExpanded ? `${CARD_WIDTH}px ${CARD_WIDTH}px` : `${CARD_WIDTH}px 0`)};
	transition: grid-template-columns 300ms ease-in-out;
	overflow-y: auto;
`;

export const MainColumn = styled.div`
	overflow-y: overlay;
`;
