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
import { Typography } from '@material-ui/core';

import { COLOR } from '../../../styles/colors';

export const Container = styled.div`
  background-color: ${COLOR.WHITE_87};
  padding: 10px;
`;

export const UserMessage = styled.span`
  background-color: ${COLOR.WHITE};
  color: ${COLOR};
  padding: 6px;
  box-shadow: 0 2px 5px ${COLOR.BLACK_6};
  display: inline-block;
  font-size: 12px;
`;

export const SystemMessage = styled.span`
  color: ${COLOR.BLACK_60};
  padding: 4px 0;
  display: inline-block;
  font-size: 12px;
`;

export const ScreenshotMessage = styled.span`
  background-color: ${COLOR.WHITE};
  padding: 6px;
  box-shadow: 0 2px 5px ${COLOR.BLACK_6};
  display: block;
  font-size: 12px;
  border-radius: 0 0 2px 2px;
`;

export const Screenshot = styled.img`
  display: block;
  max-width: 100%;
  height: 180px;
  width: 100%;
  object-fit: cover;
  margin: 8px 0 0;
  border-radius: ${(props: any) => props.withMessage ? '2px 2px 0 0' : '2px'};
` as any;

export const Info = styled.div`
  color: ${COLOR.BLACK_40};
  display: flex;
  font-size: 11px;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;
