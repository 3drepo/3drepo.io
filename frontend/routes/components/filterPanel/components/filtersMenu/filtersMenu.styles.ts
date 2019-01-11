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
import List from '@material-ui/core/List';
import { COLOR } from '../../../styles/colors';
import ListItem from '@material-ui/core/ListItem';
import { DatePicker } from 'material-ui-pickers';

export const MenuList = styled(List)`
  background-color: ${COLOR.WHITE};
  width: 100%;
  min-width: 140px;
  max-width: 300px;
`;

export const NestedWrapper = styled.div`
  position: relative;
`;

export const ChildMenu = styled.div`
  background-color: ${COLOR.WHITE};
  position: absolute;
  left: 100%;
  top: 0;
  z-index: 1;
  min-width: 150px;
  max-width: 400px;
  width: 100%;
`;

export const StyledItemText = styled.div`
  color: ${COLOR.BLACK_60};
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

export const StyledListItem = styled(ListItem)`
  && {
    padding: 4px 10px;
    height: 30px;
  }
`;

export const StyledDatePicker = styled(DatePicker)`
  && {
    margin-left: 10px;
  }

  input {
    font-size: 12px;
  }
`;

export const CopyItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 0;
`;

export const CopyText = styled.span`
  margin-left: 4px;
`;

export const MenuFooter = styled.div`
  border-top: 1px solid ${COLOR.BLACK_40};
  margin-top: 6px;
`;
