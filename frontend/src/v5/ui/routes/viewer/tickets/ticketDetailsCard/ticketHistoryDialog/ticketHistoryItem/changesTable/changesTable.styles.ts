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

import { TextOverflow } from '@controls/textOverflow';
import styled from 'styled-components';
import { ColumnWidths } from '../../ticketHistory.helpers';

export const ChangeRow = styled.div`
	display: grid;
	grid-template-columns: ${ColumnWidths.ChangePropertyName}px ${ColumnWidths.ChangeDetails}px;
`;

export const ChangePropertyName = styled.div`
	font-weight: bold;
`;

export const DetailContainer = styled.div`
	display: inline-flex;
`;

export const ErrorMessage = styled.span`
	font-weight: bold;
	color: ${({ theme }) => theme.palette.error.main};
`;

export const ChangeValue = styled(TextOverflow)`
	font-weight: bold;
	flex-grow: 0;
	color: ${({ theme }) => theme.palette.secondary.main};
`;
