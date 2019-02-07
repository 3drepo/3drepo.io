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
import Button from '@material-ui/core/Button';

import * as PanelStyles from '../components/panel/panel.styles';
import { COLOR } from '../../styles';

export const Container = styled(Grid)`
  && {
    height: 100%;
    padding-top: 30px;
  }

  ${PanelStyles.Container} {
    margin-top: 30px;
    width: 100%;
  }

  ${PanelStyles.Content} {
    padding: 20px;
  }
`;

export const Message = styled.div`
  color: ${COLOR.BLACK_60};
  white-space: pre-line;
`;

export const StyledButton = styled(Button)`
  && {
    margin-left: -5px;
    padding: 0 8px;
  }
` as any;

export const Buttons = styled(Grid)`
  && {
    margin-top: 10px;
  }
`;
