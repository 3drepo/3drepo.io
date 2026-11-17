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
import { ColumnWidths } from './ticketHistory.helpers';
import { ChipContainer } from '@controls/chip/baseChip/baseChip.styles';
import { ModalBody as BaseModalBody } from '@controls/formModal/modalBody/modalBody.styles';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';

export const ModalBody = styled(BaseModalBody)`
	min-width: 1212px;
`;

export const TicketHistoryTable = styled.div`
	border-radius: 10px;
	overflow: hidden;
`;

export const NoHistoryMessage = styled(EmptyListMessage)`
	padding: 20px;
	margin: 10px 0;
`;

export const ItemContainer = styled.li<{ selected?: boolean }>`
	width: 100%;
	min-height: 80px;
	padding: 15px 29px;
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	list-style: none;

	border-bottom: 1px solid ${({ theme }) => theme.palette.tertiary.lightest};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.base.main};
`;

export const TimestampContainer = styled.div`
    flex-shrink: 0;
	width: ${ColumnWidths.Timestamp}px;
`;
export const Author = styled.div`
    flex-shrink: 0;
	width: ${ColumnWidths.Author}px;
	display: inline-flex;
	gap: 5px;
	align-items: center;
	font-size: 15px;
`;

export const ActionType = styled.div`
    flex-shrink: 0;
	width: ${ColumnWidths.ActionType}px;
`;

export const UpdateChip = styled(ChipContainer)`
	color: ${({ theme }) => theme.palette.tertiary.mid};
	border-color: ${({ theme }) => theme.palette.tertiary.mid};
	background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	pointer-events: none;
`;

export const ImportChip = styled(UpdateChip)`
	color: ${({ theme }) => theme.palette.success.dark};
	border-color: ${({ theme }) => theme.palette.success.dark};
	background-color: ${({ theme }) => theme.palette.success.lightest};
`;
