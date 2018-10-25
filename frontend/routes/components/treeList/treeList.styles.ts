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
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';

import { COLOR, ellipsis } from '../../../styles';

export const Headline = styled.div`
  cursor: pointer;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 24px;
  padding-right: 13px;

  &:hover {
    background: ${COLOR.WHITE};
  }
`;

export const Details = styled.div`
  transition: all 200ms ease-in-out;
  box-shadow: 0 12px 30px ${(props: any) => props.disableShadow ? 'none' : 'currentColor'};
`;

export const Container = styled.div`
  overflow: hidden;
  border-bottom: 1px solid ${COLOR.BLACK_6};
  background: ${(props: any) => props.active ? COLOR.WHITE : 'rgba(250, 250, 250)'};
  transition: background 150ms ease-in-out;
  color: ${(props: any) => props.disabled ? COLOR.BLACK_30 : COLOR.BLACK_60};
  user-select: none;

	& > ${Headline} {
		padding-left: ${(props: any) => (props.level || 0) * 24}px;
  }
`;

export const HeadlineContainer = styled(Grid)`
  padding-left: 24px;
`;

export const Title = styled.div`
  font-size: 14px;
  ${ellipsis('100%')}
`;

export const StyledIcon = styled(Icon)`
  && {
    margin-right: 12px;
  }
`;
