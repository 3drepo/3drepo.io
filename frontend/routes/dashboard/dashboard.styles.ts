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
import * as PanelStyles from '../components/panel/panel.styles';

export const Container = styled(Grid)`
  && {
    padding: 30px 50px 60px 50px;
    height: 100%;
    overflow: hidden;
  }
`;

export const Sidebar = styled(Grid)`
  && {
    margin-right: 50px;
  }
`;

export const Content = styled(Grid)`
  && {
    flex: 1;
    overflow: hidden;
    filter: drop-shadow(0px 2px 1px rgba(0,0,0,0.25));
  }

  ${PanelStyles.Container} {
    box-shadow: none;
  }
`;
