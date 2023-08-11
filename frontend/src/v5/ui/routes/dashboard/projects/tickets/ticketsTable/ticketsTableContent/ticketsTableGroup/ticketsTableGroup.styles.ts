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

import { Typography } from '@controls/typography';
import styled from 'styled-components';

export const Headers = styled.div`
	display: grid;
	grid-template-columns: 80fr 493fr 96fr 62fr 90fr 90fr 100fr 137fr 134fr;
	justify-content: flex-start;
	margin-bottom: 10px; 
`;

export const Header = styled(Typography).attrs({
	variant: 'kicker',
})`
	color: ${({ theme }) => theme.palette.base.main};
	margin-left: 10px;
`;

export const Group = styled.div`
	display: grid;
	border-radius: 10px;
	overflow: hidden;
	gap: 1px;
	background-color: transparent;
`;

export const NewTicketRow = styled.div`
	width: 100%;
	height: 37px;
	font-weight: 600;
	cursor: pointer;
	color: ${({ theme }) => theme.palette.base.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	display: flex;
	align-items: center;
	padding-left: 15px;
	gap: 6px;
`;

export const NewTicketText = styled(Typography).attrs({
	variant: 'body1',
})`
	font-weight: 600;
`;
