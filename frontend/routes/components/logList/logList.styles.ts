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
import { COLOR } from '../../../styles';

export const Container = styled.div`
  background: ${COLOR.BLACK_20};
  min-height: 55px;
  overflow: auto;
  position: relative;

  &:before {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    width: 100%;
    content: '';
    height: 10px;
    overflow: hidden;
    box-shadow: inset 0px 4px 7px -4px ${COLOR.BLACK_30};
  }
`;
