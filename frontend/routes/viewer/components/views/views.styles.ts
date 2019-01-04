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
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Input from '@material-ui/core/Input';

import { COLOR } from '../../../../styles/colors';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ViewsCountInfo = styled.p`
  color: ${COLOR.BLACK_40};
  text-align: left;
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const ViewpointsList = styled(MenuList)`
  && {
    padding: 0;
    overflow: auto;
    max-height: 70vh;
  }
`;

export const ViewpointItem = styled(MenuItem)`
  && {
    height: 80px;
    padding: 8px;
    background-color: ${(props: any) => props.active ? `${COLOR.BLACK_6}` : 'initial'};
  }

  &&:not(:first-child) {
    border-top: 1px solid ${COLOR.BLACK_20};
  }
` as any;

export const EmptyStateInfo = styled.p`
  padding: 24px;
`;

export const NewItemWrapper = styled.div`
  display: flex;
  flex: 1;
`;

export const SearchField = styled(Input)`
  && {
    width: 100%;
    flex: none;
  }
`;
