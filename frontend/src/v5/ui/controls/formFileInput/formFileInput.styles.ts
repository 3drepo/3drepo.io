/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { Button as ButtonBase } from '@controls/button';
import { ErrorMessage as ErrorMessageBase } from '@controls/errorMessage/errorMessage.component';

export const Container = styled.div`
	display: contents;
`;

export const Button = styled(ButtonBase)`
	padding: 0;
	margin: 0;
	width: fit-content;
`;

export const Label = styled.label`
	cursor: pointer;
	padding: 10px 15px;
`;

export const Input = styled.input.attrs({
	type: 'file',
})`
	display: none;
`;

export const ErrorMessage = styled(ErrorMessageBase)`
	margin-top: 10px;
`;
