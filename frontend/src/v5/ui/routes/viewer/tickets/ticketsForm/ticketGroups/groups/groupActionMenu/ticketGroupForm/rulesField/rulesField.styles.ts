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

import { Button as ButtonBase } from '@controls/button';
import { FormTextField } from '@controls/inputs/formInputs.component';
import styled from 'styled-components';
import CloseIconBase from '@assets/icons/controls/clear_circle.svg';

export const TextField = styled(FormTextField)`
	margin: 0;
	padding-right: 7px;

	input {
		padding-right: 0;
	}
`;

export const Container = styled.div`
	display: flex;
	align-items: center;
	width: 342px;
	margin-bottom: 10px;
`;

export const Button = styled(ButtonBase).attrs({
	color: 'primary',
	variant: 'contained',
})`
	height: 26px;
	margin: 0 0 0 8px;
	width: fit-content;
`;

export const CloseIcon = styled(CloseIconBase)`
	color: ${({ theme }) => theme.palette.secondary.main};
	height: 15px;
	cursor: pointer;
`;
