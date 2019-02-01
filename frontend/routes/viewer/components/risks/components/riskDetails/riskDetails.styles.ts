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
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';

import { TextField } from '../../../../../components/textField/textField.component';

export const StyledTextField = styled(TextField)``;
export const StyledFormControl = styled(FormControl)``;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${StyledTextField},
  ${StyledFormControl} {
    margin: 8px 0;
  }
`;

export const FieldsRow = styled(Grid)`
  ${StyledTextField},
  ${StyledFormControl} {
    flex: 1;

    &:nth-child(2n + 1) {
      margin-right: 25px;
    }
  }

  .select {
    color: inherit;
  }
`;
