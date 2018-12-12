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
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';

import { COLOR } from '../../../../../../styles';

export const Header = styled.div``;

export const Headline = styled(Typography)`
  && {
    margin-top: 24px;
  }
`;

export const StyledTextField = styled(TextField)`
  width: 100%;
`;

export const FooterWrapper = styled.div`
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const StyledSaveButton = styled(IconButton)`
  && {
    align-self: flex-end;
    background-color: ${COLOR.SECONDARY_MAIN};
    color: ${COLOR.WHITE};

    &:disabled {
      background-color: ${COLOR.GRAY};

      svg {
        color: ${COLOR.WHITE};
      }
    }

    &:hover {
      background-color: ${COLOR.SECONDARY_LIGHT};

      svg {
        color: ${COLOR.WHITE};
      }
    }
  }
`;
