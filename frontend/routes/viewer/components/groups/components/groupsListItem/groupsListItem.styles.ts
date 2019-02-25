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
import { COLOR } from '../../../../../../styles/colors';

export const MenuItemContainer = styled(MenuItem)`
  position: relative;

  && {
    background-color: ${(props: any) => props.highlighted ? COLOR.BLACK_6 : COLOR.WHITE};
    height: auto;
    border-bottom: 1px solid ${COLOR.BLACK_6};
    padding: 0;

    &:hover {
      background-color: ${(props: any) => props.highlighted ? COLOR.BLACK_20 : COLOR.GRAY};
    }
  }
` as any;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  flex: 1;
  padding: 5px 0;
`;

export const Info = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

export const AuthorWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const Actions = styled.div`
  display: flex;
`;

export const StyledIcon = styled.span`
  color: ${(props) => props.color ? props.color : COLOR.BLACK_60 };
  font-size: 18px;
`;
