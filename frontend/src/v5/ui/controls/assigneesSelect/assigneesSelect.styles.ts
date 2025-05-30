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

import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import styled from 'styled-components';

export const ValuesAndClearButton = styled.div`
	display: inline-flex;
	flex-direction: row;
	align-items: center;
`;

export const AssigneesListContainer = styled.div`
	display: inline-flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	user-select: none;
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 10px;
	line-height: 100%;
	width: 100%;
	height: 24px;

	${Spinner} {
		margin: 6px 0;
	}
`;
