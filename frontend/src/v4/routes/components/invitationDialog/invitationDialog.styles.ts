/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import ButtonBase from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButtonBase from '@mui/material/IconButton';
import TextFieldBase from '@mui/material/TextField';
import styled from 'styled-components';
import { COLOR } from '../../../styles';
import { PermissionsTable as PermissionsTableBase } from '../permissionsTable/permissionsTable.component';

export const Container = styled.div`
	min-width: 782px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
`;

export const TextField = styled(TextFieldBase)`
	&& {
		margin-bottom: 10px;
	}
`;

export const Content = styled.div`
	padding: 25px;
	padding-bottom: 12px;
	overflow: auto;
	display: flex;
	flex-direction: column;
`;

export const Footer = styled.div`
	padding: 12px 25px;
	padding-bottom: 18px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

export const AddButton = styled(ButtonBase)`
	&& {
		display: flex;
		flex: none;
		flex-direction: row;
		justify-content: flex-start;
		width: 300px;
		margin-left: -10px;
		padding-left: 8px;
		line-height: 2px;

		svg {
			margin-right: 14px;
		}
	}
`;

export const CancelButton = styled(ButtonBase)`
	&& {
		margin-right: 10px;
	}
`;

export const IconButton = styled(IconButtonBase)`
	&& {
		padding: 5px;
		margin-left: -7px;
		margin-right: 10px;
		margin-bottom: -2px;
	}
`;

export const PermissionsTable = styled(PermissionsTableBase)<{ modelsNumber: number }>`
	&& {
		height: ${({ modelsNumber }) => `calc(62px * ${modelsNumber} + 22px)`};
		width: fit-content;
		margin-top: 15px;
		margin-bottom: 15px;
		border: 1px solid ${COLOR.BLACK_6};
		border-bottom: none;
		padding: 10px 0;
		box-sizing: border-box;
	}
`;

export const ProjectConfig = styled.div`
	display: flex;
	align-items: flex-end;
	justify-content: flex-start;
`;

export const ProjectCheckboxContainer = styled(FormControlLabel)`
	&& {
		height: 30px;
		margin-left: 0;
	}
`;
