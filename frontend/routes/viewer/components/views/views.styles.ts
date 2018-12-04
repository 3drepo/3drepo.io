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
import MenuList from '@material-ui/core/MenuList';

import { COLOR } from '../../../../styles/colors';

export const FooterWrapper = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  justify-content: flex-end;
`;

export const ViewsCountInfo = styled.p`
  color: ${COLOR.BLACK_40};
  width: 100%;
  text-align: center;
  position: absolute;
  left: 0;
  height: 100%;
  top: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ViewpointsList = styled(MenuList)`
  && {
    padding: 0;
  }
`;

export const ViewpointItem = styled(MenuItem)`
  && {
    height: 80px;
    padding: 8px;
  }

  &&:not(:first-child) {
    border-top: 1px solid ${COLOR.BLACK_20};
  }
`;

export const Thumbnail = styled.img`
  width: 79px;
  height: 79px;
`;

export const ThumbnailPlaceholder = styled.div`
  width: 79px;
  height: 79px;
  border: 1px solid ${COLOR.BLACK_20};
`;

export const Name = styled.h3`
  margin-left: 16px;
`;

export const EmptyStateInfo = styled.p`
  padding: 24px;
`;
