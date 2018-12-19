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

import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { COLOR } from '../../../styles';

export const Title = styled.div`
	font-size: 14px;
	color: ${COLOR.BLACK_20};
`;

export const TextFieldWrapper = styled.div`
  margin: 8px;
`;

export const StyledTextField = styled(TextField) `
  font-size: 14px;
`;

export const StyledTextFieldContainer = styled(Grid) `
	flex: 1;
`;

export const StyledButton = styled(Button) `
	&& {
    margin-right: 8px;
	}
`;

export const Container = styled.div`
  background-color: ${COLOR.WHITE};
`;

export const Actions = styled.div`
	margin-top: 12px;
  border-top: 1px solid ${COLOR.BLACK_6};
  display: flex;
  justify-content: space-between;
  padding: 8px;
  align-items: center;
`;

export const ActionsGroup = styled.div`
  display: flex;
`;
