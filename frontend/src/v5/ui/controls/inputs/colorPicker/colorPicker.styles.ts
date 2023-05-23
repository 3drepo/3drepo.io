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
import { InputContainer } from '../inputContainer/inputContainer.styles';

export const Container = styled(InputContainer)<{ disabled: boolean; }>`
	display: flex;
	flex-direction: row;
	align-items: center;
	width: fit-content;
	padding: 7px 9px;
	cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

	svg {
		margin-left: 8px;
		color: ${({ theme }) => theme.palette.base.main};
	}
`;
