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
import * as ColorPickerStyles from '../../components/colorPicker/colorPicker.styles';

export const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;


  ${ColorPickerStyles.ColorSelect} {
    border-bottom: none;
    width: 60px;
  }
`;

export const Canvas = styled.canvas``;

export const ToolsContainer = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;
  background: ${COLOR.WHITE};
  padding: 10px 30px;
  box-shadow: 0 0 10px ${COLOR.BLACK_20};
  border-radius: 4px;
`;
