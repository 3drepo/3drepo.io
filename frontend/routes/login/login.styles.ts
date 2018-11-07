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
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { COLOR, FONT_WEIGHT } from '../../styles';
import * as PanelStyles from '../components/panel/panel.styles';

const CONTENT_PADDING = 20;

export const Container = styled(Grid)`
  ${PanelStyles.Content} {
    padding: ${CONTENT_PADDING}px;
    overflow-y: auto;
    overflow-x: hidden;
  }
`;

export const Headline = styled.h3`
  color: ${COLOR.BLACK_60};
  font-weight: ${FONT_WEIGHT.NORMAL};
  margin-top: 10px;
`;

export const StyledButton: any = styled(Button)`
  && {
    padding: 0 5px;
    margin: 0;
    min-width: auto;
  }
`;

export const LoginButtons = styled(Grid)`
  && {
    padding: 10px 0;
    padding-bottom: 25px;
  }

  ${StyledButton} {
    margin-left: -5px;
  }
`;

export const FooterContainer = styled(Grid)`
  && {
    border-top: 1px solid ${COLOR.BLACK_6};
    margin-left: -${CONTENT_PADDING}px;
    width: calc(100% + ${CONTENT_PADDING * 2}px);
    padding: ${(CONTENT_PADDING / 2)}px ${CONTENT_PADDING}px;
    padding-right: ${CONTENT_PADDING - 5}px;
    margin-bottom: -${CONTENT_PADDING}px;
    font-size: 14px;

    ${StyledButton} {
      margin-left: 5px;
      color: ${COLOR.BLACK_60};
    }
  }
`;

export const Version = styled(Grid)`
  &&, && ${StyledButton} {
    color: ${COLOR.BLACK_30};
  }
`;
