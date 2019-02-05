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
import { COLOR } from '../../styles';
import { IconButton, Button } from '@material-ui/core';

const BaseStyles = styled(Grid)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const ItemLabel = styled(BaseStyles)`
  font-size: 14px;
  color: ${COLOR.BLACK_60};
`;

export const ItemLabelDetail = styled(BaseStyles)`
  font-size: 10px;
  color: ${COLOR.BLACK_40};
  line-height: 13px;
`;

export const BarIconButton = styled(IconButton)`
  && {
    color: rgba(255, 255, 255, 0.87);
  }

  &:first-child {
    margin-right: -18px;
  }

  &:hover {
    background-color: ${COLOR.WHITE}
  }
`;

export const UserActionButton = styled(Button)`
  && {
    color: ${COLOR.WHITE};
    text-shadow: 0 0 3px ${COLOR.BLACK_20};
    min-width: 0;
    min-height: 0;
    padding: 0;
  }

  &&:hover {
    background-color: transparent;
  }
`;
