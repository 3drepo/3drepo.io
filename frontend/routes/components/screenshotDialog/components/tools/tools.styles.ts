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

import styled, { css } from 'styled-components';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import { COLOR } from '../../../../../styles';
import * as ColorPickerStyles from '../../../../components/colorPicker/colorPicker.styles';

export const StyledButton = styled(Button)`
  && {
    padding: 8px;
  }

  &:last-child {
    margin-left: 8px;
  }
`;

export const ToolsContainer = styled.div`
  position: absolute;
  z-index: 3;
  bottom: 35px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;
  background: ${COLOR.WHITE_87};
  padding: 5px 10px 5px 20px;
  box-shadow: 0 0 10px ${COLOR.BLACK_20};
  border-radius: 4px;
  transition: opacity 200ms ease-in-out;

  ${ColorPickerStyles.ColorSelect} {
    border-bottom: none;
    width: 60px;
  }

  &[disabled] {
    padding-left: 10px;

    ${StyledButton} {
      margin-left: 0;
    }
  }
` as any;

export const OptionsDivider = styled(Divider)`
  && {
    margin: 0 12px;
    height: 48px;
    width: 1px;
    opacity: 0.5;
  }
`;
