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
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { COLOR } from '../../../../styles';

export const ModelName = styled.h3`
  margin: 0 0 24px;
  color: ${COLOR.BLACK_60};
`;

export const ModelInfo = styled.p`
  color: ${COLOR.BLACK_40};
  margin: 0;
  font-size: 14px;
`;

export const HiddenFileInput = styled.input`
  visibility: hidden;
  width: 0;
`;

export const FileLabel = styled.label`
 && {
    margin: 0 4px 0 0;
  }
`;

export const StyledDialogActions = styled(DialogActions)`
  && {
    margin: 0;
  }
`;

export const CancelButton = styled(Button)`
  && {
    margin: 0 4px 0 0;
  }
`;
