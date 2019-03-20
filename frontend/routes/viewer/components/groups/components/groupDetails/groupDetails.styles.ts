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
import FormControl from '@material-ui/core/FormControl';

import { TextField } from '../../../../../components/textField/textField.component';
import { COLOR } from '../../../../../../styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FieldsRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

export const StyledTextField = styled(TextField)`
  width: 100%;

  && {
    margin: 0 25px 0 0;
  }
`;

export const LongLabel = styled.div`
  white-space: nowrap;
`;

export const StyledFormControl = styled(FormControl)`
  width: 100%;

  && {
    margin: 0;
  }
`;

export const Actions = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`;

export const ColorPickerWrapper = styled.div`
  display: inline;
`;

export const Description = styled(TextField)`
  margin-bottom: -16px;
`;

export const StyledIcon = styled.span`
  color: ${(props) => props.color ? props.color : COLOR.BLACK_54};
  font-size: 18px;
`;
