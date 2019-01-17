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
import MenuItem from '@material-ui/core/MenuItem';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import Typography from '@material-ui/core/Typography';

import { COLOR } from '../../../../styles/colors';

export const MenuItemContainer = styled(MenuItem)`
  position: relative;

  && {
    background-color: ${(props: any) => props.expired ? COLOR.WARNING_LIGHT : COLOR.WHITE};
    height: auto;
    border-bottom: 1px solid ${COLOR.BLACK_6};
    padding: 0;

    &:hover {
      background-color: ${(props: any) => props.expired ? COLOR.WARNING : COLOR.GRAY};
    }
  }
` as any;

export const ArrowContainer = styled.div`
  background-color: ${COLOR.PRIMARY_DARK};
  position: absolute;
  right: 0;
  top: 0;
  width: 28px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledArrowIcon = styled(ArrowIcon)`
  color: ${COLOR.WHITE};
`;

export const Name = styled(Typography)`
  && {
    line-height: 1;
  }
`;

export const Container = styled.div`
  display: flex;
  height: 80px;
  overflow: hidden;
  flex: 1;
  padding: 7px 40px 7px 7px;
`;

export const Thumbnail = styled.img`
  background-color: ${COLOR.GRAY};
  display: block;
  margin-right: 7px;
  height: 100%;
  width: 80px;
  max-width: 100%;
`;

export const ThumbnailWrapper = styled.div`
  width: auto;
`;

export const Content = styled.div`
  min-width: 0;
  flex: 1;
`;

export const Description = styled.div`
  font-size: 11px;
  line-height: 1.25;
  margin-top: 3px;
  color: ${COLOR.BLACK_60};
`;

export const RoleIndicator = styled.div`
  background-color: ${(props: any) => props.color || COLOR.WHITE};
  border: 1px solid ${(props: any) => props.color ? COLOR.GRAY : COLOR.BLACK_20};
  height: auto;
  margin-right: 7px;
  width: 5px;
`;
