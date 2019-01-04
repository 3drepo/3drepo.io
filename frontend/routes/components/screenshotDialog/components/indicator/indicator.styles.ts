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
import { COLOR } from '../../../../../styles';

export const StyledIndicator = styled.div`
  border-radius: 100%;
  width: ${(props: any) => props.size}px;
  height: ${(props: any) => props.size}px;
  color: ${(props: any) => props.color || COLOR.WHITE};
  border: 2px solid currentColor;
  opacity: .8;
  position: absolute;
  z-index: 2;
  left: 0;
  top: 0;
  pointer-events: none;
` as any;
