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
  overflow: hidden;
  border-bottom: 1px solid ${COLOR.BLACK_6};
  background: ${(props: any) => props.active ? 'transparent' : COLOR.WHITE};
  transition: background 150ms ease-in-out;
`;

export const Headline = styled.div`
  cursor: pointer;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 24px;

  &:hover {
    background: ${COLOR.WHITE};
  }
`;

export const Details = styled.div`
  transition: all 200ms ease-in-out;
  height: ${(props: any) => props.active ? props.maxHeight : 0};
`;
