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
import { Link } from 'react-router-dom';

export const ListItemContainer = styled.li`
  height: 72px;
  display: flex;
  border-top: 1px solid #dcdcdc;
  background-color: rgb(250,250,250);
  transition: background-color .4s cubic-bezier(.25,.8,.25,1);

  &:hover {
    background-color: rgba(158,158,158,0.2);
  }
`;

export const StyledLink = styled(Link)`
  color: rgba(0, 0, 0, 0.87);
`;
