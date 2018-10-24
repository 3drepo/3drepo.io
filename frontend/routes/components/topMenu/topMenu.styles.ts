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
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  z-index: 2;
  padding-right: 5px;
  height: 80px;
`;

export const Logo = styled.img`
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
	pointer-events: inherit;
	outline: none;
	user-select: none;
  filter: drop-shadow(0px 0px 1px ${COLOR.BLACK_50});

  &:hover {
    cursor: pointer;
	  user-select: none;
  }

  @media (max-width: 767px) {
    & {
      display: none;
    }
  }
`;
