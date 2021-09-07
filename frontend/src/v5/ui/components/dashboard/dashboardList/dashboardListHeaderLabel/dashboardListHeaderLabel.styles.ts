/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import styled, { css } from 'styled-components';
import { Button as ButtonComponent } from '@controls/button';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';

export const Container = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  color: ${({ theme }) => theme.palette.base.main};

  ${({ width }) => width && css`
    flex-grow: 0;
    width: ${width}px;
  `}
`;

export const Button = styled(ButtonComponent).attrs(
	{
		variant: 'text',
	},
)`
  color: ${({ theme }) => theme.palette.base.main};
  justify-content: flex-start;
  padding: 0;
  margin: 0;
  line-height: normal;

  &:hover, &:active {
    text-decoration-line: none;
  }
`;

export const Indicator = styled.div`
  margin-left: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  svg {
    height: 7px;
    width: 100%;
  }

  ${({ sortingDirection }) => sortingDirection === SortingDirection.ASCENDING && css`
    svg {
      transform: rotate(180deg);
    }
  `};
`;
