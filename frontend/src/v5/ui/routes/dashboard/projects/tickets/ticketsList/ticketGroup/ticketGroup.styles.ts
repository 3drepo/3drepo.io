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

export const ColumnsContainer = styled.div`
	display: grid;
	grid-template-columns: 80fr 493fr 96fr 62fr 90fr 90fr 100fr 137fr 134fr;
	justify-content: flex-start;
`;

export const TicketRowContainer = styled(ColumnsContainer)`
	height: 30px;
	background: white;
	cursor: pointer;
	margin-bottom: 5px;
`;
