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

import styled from 'styled-components';

export const Container = styled.div`
  padding: ${({ theme }) => `${theme.spacing(2)}px`};
`;

export const ContrastBackground = styled.div`
  padding: ${({ theme }) => `${theme.spacing(2)}px`};
  background-color: ${({ theme }) => theme.palette.secondary.main};
`;

export const BaseBackground = styled.div`
  padding: ${({ theme }) => `${theme.spacing(2)}px`};
  background-color: #e5e5e5;
`;

export const Group = styled.div`
  margin-top: 30px;
`;

export const AppBarGroup = styled(Group)`
  header {
    position: relative !important;
  }
`;
