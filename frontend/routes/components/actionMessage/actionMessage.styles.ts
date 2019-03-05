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
import { COLOR, FONT_WEIGHT } from '../../../styles';

export const Container = styled.div`
  background: ${COLOR.GRAY_60};
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

export const Message = styled.div`
  background: ${COLOR.WHITE};
  font-weight: ${FONT_WEIGHT.NORMAL};
  color: ${COLOR.BLACK_80};
  padding: 8px 10px;
  border-radius: 4px;
`;
