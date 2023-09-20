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

import styled, { css } from 'styled-components';
import AddCircleBase from '@assets/icons/filled/add_circle-filled.svg';

export const Container = styled.div<{ disabled?: boolean }>`
	&& {

		color: ${({ theme }) => theme.palette.primary.dark};
		display: inline-flex;
		flex-flow: row;
		align-items: flex-start;
		padding: 12px;
		
		${({ theme, disabled }) => disabled && css`
			cursor: default;
			pointer-events: none;
			color: ${theme.palette.base.lighter};
		`}
	}
`;

export const AddCircleIcon = styled(AddCircleBase)`
	height: 18px;
	width: 18px;
	box-sizing: border-box;
	margin-right: 6px;
`;

export const Message = styled.div`
	width: calc(100% - 30px);
`;
