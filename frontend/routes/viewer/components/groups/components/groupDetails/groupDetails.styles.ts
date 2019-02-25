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
import TextField from '@material-ui/core/TextField';
export const Container = styled.div``;

export const FieldsRow = styled.div`
  display: flex;
  margin-top: 10px;
`;

export const StyledTextField = styled(TextField)`
  &:first-of-type {
    width: 100%;
  }

  &:nth-of-type(2) {
    width: 90%
  }

  && {
    margin: 1px 6px 0 0;
  }
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
