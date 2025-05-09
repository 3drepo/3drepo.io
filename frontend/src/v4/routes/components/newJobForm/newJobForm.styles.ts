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

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import styled from 'styled-components';

import { COLOR } from '../../../styles';

export const Title = styled.div`
	font-size: 14px;
	color: ${COLOR.BLACK_20};
`;

export const StyledTextField = styled(TextField) `
	&& {
		font-size: 14px;
		margin-top: 0;
		margin-bottom: 12px;
	}
`;

export const StyledTextFieldContainer = styled(Grid) `
	flex: 1;
`;

export const SaveButton = styled(Button) `
	&& {
		width: 100%;
		margin-top: 16px;
	}
`;

export const Container = styled.div`
	width: 250px;

	${StyledTextField},
	${Title} {
		margin-bottom: 12px;
	}
`;
