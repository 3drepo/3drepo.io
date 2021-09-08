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

import { Checkbox as CheckboxComponent } from '@material-ui/core';
import styled from 'styled-components';

export const Checkbox = styled(CheckboxComponent)`
  && {
    padding: 10px;

    svg {
      height: 16px;
      width: 16px;

      path {
        fill: none;
        stroke: ${({ theme }) => theme.palette.secondary.light};
      }
    }

    &.Mui-checked {
      path {
        fill: ${({ theme }) => theme.palette.favourite.main};
        stroke: ${({ theme }) => theme.palette.favourite.main};
      }
    }

    &.Mui-focusVisible {
      background-color: ${({ theme }) => theme.palette.tertiary.lightest};
    }

    &:hover {
      background-color: ${({ theme }) => theme.palette.tertiary.lightest};
    }

    &:active {
      background-color: ${({ theme }) => theme.palette.base.lightest};
    }

    &.Mui-disabled {
      path {
        fill: ${({ theme }) => theme.palette.secondary.lightest};
        stroke: ${({ theme }) => theme.palette.secondary.lightest};
      }
    }
  }
`;
