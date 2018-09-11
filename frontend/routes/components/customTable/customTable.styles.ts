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
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import Select from '@material-ui/core/TableRow';

import * as JobItem from '../jobItem/jobItem.styles';
import * as CellUser from './components/cellUser/cellUser.styles';
import * as CellSelect from './components/cellSelect/cellSelect.styles';

export const StyledSelect = styled(Select)``;

export const Container = styled(Table)`
  width: 100%;

  ${CellUser.Name},
  ${CellSelect.StyledSelect} {
    color: rgba(0, 0, 0, .6);
    font-size: 14px;
  }

  ${CellSelect.StyledSelect}:after,
  ${CellSelect.StyledSelect}:before {
    display: none;
  }
`;

export const Row = styled(TableRow)`
  height: 62px !important;
`;
