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
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

export const ColorSelect = styled(Grid)`
  cursor: pointer;
`;

export const Dot = styled(Grid)`
  width: 16px;
  height: 16px;
  border-radius: 100%;
  background-color: ${(props) => props.color || 'transparent'};
  border: 2px dotted ${(props) => props.color ? 'transparent' : 'rgba(0, 0, 0, .38)'};
`;

export const Panel = styled(Popover)``;

/* 
color - picker {
  min - width: 50px;
}

.colorPicker {
  height: 32px;
  position: relative;
  width: 100 %;
  padding - left: 1px;
}

.colorPickerSelect {
  outline: none;
  cursor: pointer;
  border - bottom: 1px solid rgba(0, 0, 0, .12);
}

.colorPickerValue,
.colorPickerPlaceholder{
  width: 16px;
  height: 16px;
  border - radius: 100 %;
}

.colorPickerPlaceholder {
  border: 2px dotted rgba(0, 0, 0, .38);
}

.colorPickerIcon {
  margin - left: 5px;
}

.colorPickerPanel {
  width: 228px;
  padding: 16px;
  box - shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 1);
}

.colorPickerPredefinedColors {
  padding - bottom: 14px;
}

.colorPickerPredefinedColor {
  border - radius: 100 %;
  width: 20px;
  height: 20px;
  cursor: pointer;
  outline: none;
  transition: box - shadow 200ms ease -in -out;
}

.colorPickerPredefinedColor: hover {
  box - shadow: inset 0 0 10px rgba(0, 0, 0, .5)
}

.colorPickerPredefinedColor: not(: last - child) {
  margin - right: 15px;
}

.colorPickerCanvas {
  padding - bottom: 14px;
}

.colorPickerCanvas.colorPickerBlockWrapper,
.colorPickerCanvas.colorPickerStripWrapper {
  position: relative;
}

.colorPickerCanvas.colorBlock,
.colorPickerCanvas.colorStrip {
  cursor: crosshair;
  height: 170px;
}

.colorPickerCanvas.colorPointer {
  position: absolute;
  pointer - events: none;
}

.colorPickerBlockWrapper.colorPointer {
  width: 6px;
  height: 6px;
  border: 1px solid #fff;
  border - radius: 100 %;
  content: "";
  transform: translate(-3px, -6px);
}

.colorPickerCanvas.colorBlock {
  width: 185px;
}

.colorPickerCanvas.colorStrip {
  width: 23px;
}

.colorPickerSelectedColor {
  width: 55px;
  height: 20px;
}

.colorPickerSelectedHash {
  margin - left: 14px;
  font - weight: 400;
}

.colorPickerSelectedHash input {
  width: 70px;
  height: 20px;
  color: #333333;
  font - size: 12px;
  margin - left: 2px;
  outline: none;
}

.colorPickerButtons {
  border - top: 1px solid #efefef;
  margin - top: 16px;
  min - width: calc(100 % + 32px);
  margin - left: -16px;
  margin - bottom: -16px;
  padding: 8px 16px;
}

.colorPickerButtons.md - button {
  margin - left: 0;
} */