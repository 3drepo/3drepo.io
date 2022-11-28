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
import MenuItemBase from '@mui/material/MenuItem';

export const CheckboxContainer = styled.div`
	width: 100%;
	margin: 0;
	padding: 0 14px;
	height: 34px;
	box-sizing: border-box;
	display: flex;
	align-items: center;

	.MuiCheckbox-root {
		margin: 0 8px 0 0;
		padding: 0;
	}

	.MuiFormControlLabel-label {
		color: ${({ theme }) => theme.palette.secondary.main};
	}
`;

export const MenuItem = styled(MenuItemBase)`
	&& {
		padding: 0;
	}
`;
