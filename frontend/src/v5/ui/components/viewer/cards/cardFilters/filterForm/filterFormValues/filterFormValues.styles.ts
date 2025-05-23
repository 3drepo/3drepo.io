/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { TextOverflow } from '@controls/textOverflow';
import styled from 'styled-components';

export const Value = styled(TextOverflow)`
	height: fit-content;
	max-width: 299px;
`;

export const ArrayFields = styled.div<{ maxHeight: number }>`
	max-height: ${({ maxHeight }) => maxHeight ? `${maxHeight}px` : 'unset'};
	display: flex;
	flex-direction: column;
	gap: 10px;
	overflow-y: scroll;
`;
