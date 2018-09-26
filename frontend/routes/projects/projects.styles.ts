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

import * as CellSelect from '../components/customTable/components/cellSelect/cellSelect.styles';
import * as UserManagementTab from '../components/userManagementTab/userManagementTab.styles';

const OPTIONS_HEIGHT = '100px';

export const Container = styled.div`
  width: 100%;
  height: 100%;

  ${UserManagementTab.Container} {
    height: calc(100% - ${OPTIONS_HEIGHT});
  }
`;

export const Options = styled(Grid)`
  width: 100%;
  padding: 0;
  height: ${OPTIONS_HEIGHT};

  & > * {
    padding: 24px;
    display: flex;
    align-items: center;
  }

  ${CellSelect.StyledSelect} {
    width: 100%;
  }
`;

export const SelectContainer = styled(Grid)`
  width: 45%;
`;
