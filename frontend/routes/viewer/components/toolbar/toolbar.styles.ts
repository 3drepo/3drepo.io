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
import { COLOR } from '../../../../styles';

export const Container = styled.div`
  background-color: ${COLOR.REGENT_GRAY};
  border: 1px solid ${COLOR.SILVER_CHALICE};
  border-radius: 22px;
  box-shadow: 0 3px 3px ${COLOR.BLACK_16};
  display: flex;
  height: 38px;
  padding: 0 10px;
  justify-content: center;
  align-items: center;
  visibility: ${(props: any) => props.visible ? 'visible' : 'hidden'};
` as any;

export const ButtonWrapper = styled.div`
  position: relative;
`;

export const Submenu = styled.div`
  position: absolute;
  bottom: 100%;
`;

export const ClipIconWrapper = styled.span`
  position: relative;
`;

export const ClipNumber = styled.span`
  position: absolute;
  left: 8px;
  top: 5px;
  font-size: 9px;
  font-weight: 900;
`;
