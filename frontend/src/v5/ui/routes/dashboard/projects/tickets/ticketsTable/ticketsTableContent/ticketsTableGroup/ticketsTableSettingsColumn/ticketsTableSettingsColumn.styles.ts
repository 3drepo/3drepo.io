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
import { Group } from '../ticketsTableGroup.styles';
import { Row } from '../ticketsTableRow/ticketsTableRow.styles';

export const SETTINGS_COLUMN_WIDTH = 24;
export const SettingsColumnContainer = styled(Group)`
	width: ${SETTINGS_COLUMN_WIDTH}px;
	gap: 0;
	& div > ${/* sc-selector */Row} {
		width: ${SETTINGS_COLUMN_WIDTH}px;
		border-left: 1px solid ${({ theme }) => theme.palette.tertiary.lightest};

		&:first-child{
			overflow: hidden;
		}
	}
`;