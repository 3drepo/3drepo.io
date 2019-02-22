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

export const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HiddenCanvas = styled.canvas`
  position: absolute;
  z-index: -1;
`;

export const Canvas = styled.canvas`
  position: absolute;
  z-index: 2;
`;

export const BackgroundImage = styled.img`
  width: 100%;
  text-align: center;
  margin: auto;
  padding: 0;
  position: absolute;
  bottom: 0;
  top: 0;
  user-select: none;
`;
