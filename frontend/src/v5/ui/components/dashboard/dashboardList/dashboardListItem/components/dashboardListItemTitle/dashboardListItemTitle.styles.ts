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
import { Typography } from '@material-ui/core';
import { Button } from '@controls/button';

export const Title = styled(Button).attrs({
	variant: 'text',
})`
  color: ${({ theme }) => theme.palette.secondary.main};
  padding: 0;
  margin: 0;
  line-height: normal;

  ${({ theme }) => theme.selected && css`
    color: ${theme.palette.primary.contrast};
  `}
`;

export const Subtitle = styled(Typography).attrs({
	variant: 'body1',
})`
  color: ${({ theme }) => theme.palette.base.main};

  ${({ theme }) => theme.selected && css`
    color: ${theme.palette.base.light};
  `}
`;
