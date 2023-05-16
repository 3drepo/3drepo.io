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

export const Form = styled.form`
	padding: 2px;

	.MuiFormControl-root {
		margin: 0 0 10px;
	}
`;

export const InputsContainer = styled.div`
	min-height: 112px;
	max-height: 400px;
	overflow-y: overlay;
	padding: 2px;
	margin-right: -13px;
	padding-right: 13px;
`;

export const Buttons = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-end;

	button {
		margin-bottom: 0;
		margin-top: 5px
	}
`;