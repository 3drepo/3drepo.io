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
import Paper from '@material-ui/core/Paper';

import { FONT_WEIGHT, COLOR } from '../../../styles';

export const Container = styled(Paper)`
  && {
    background: #fafafa;
    height: ${(props: any) => props.height || 'auto'};
    width: ${(props: any) => props.width || 'auto'};
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

export const Title = styled.div`
  font-size: 20px;
  font-weight: ${FONT_WEIGHT.NORMAL};
  height: 40px;
  overflow: hidden;
  min-height: 40px;
  border-radius: 4px 4px 0 0;
  background-color: ${COLOR.PRIMARY_MAIN};
  color: rgba(255,255,255,0.87);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 16px;
  position: relative;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const LoaderContainer = styled.div`
  position: relative;
  padding-top: 100px;
  display: flex;
  justify-content: center;
`;
