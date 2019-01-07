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
import Icon from '@material-ui/core/Icon';

import { COLOR } from './../../../styles/colors';

export const Container = styled.div`
  min-width: 0;
  flex: 1;
  margin-top: 5px;
`;

export const Status = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.color || COLOR.WHITE};
`;

export const Name = styled(Typography)`
  margin: 0;

  && {
    line-height: 1;
  }
`;

export const Author = styled(Typography)`
  && {
    margin-right: 6px;
    margin-left: 5px;
    color: ${COLOR.BLACK_60};
    font-size: 12px;
  }
`;

export const Date = styled.span`
  font-size: 12px;
  color: ${COLOR.BLACK_60};
`;

export const Details = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;
