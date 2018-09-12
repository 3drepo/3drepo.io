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

import { COLOR } from '../../styles';

const FOOTER_HEIGHT = 45;

export const Container = styled(Grid)`
  height: 100%;
  overflow: hidden;
`;

export const Content = styled(Grid)`
  max-height: calc(100% - ${FOOTER_HEIGHT}px);
  flex: 1;
`;

export const Footer = styled(Grid)`
  padding: 16px 24px;
  font-size: 14px;
  color: ${COLOR.BLACK_20};
  border-top: 1px solid ${COLOR.BLACK_6};
  height: ${FOOTER_HEIGHT}px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const FloatingButton = styled(Button)`
  && {
    position: absolute;
    top: 166px;
    right: 14px;
  }
`;
