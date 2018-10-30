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
import ListItem from '@material-ui/core/ListItem';
import DialogActions from '@material-ui/core/DialogActions';

export const Item = styled(ListItem)`
  display: flex;
  flex-direction: row;

  && {
    justify-content: space-between;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;

  &:first-of-type {
    margin-right: 12px;
  }

  &:last-of-type {
    margin-left: 12px;
  }
`;

export const Property = styled.div``;

export const Message = styled.p`
  width: 100%;
  text-align: center;
`;

export const StyledDialogActions = styled(DialogActions)`
	&& {
		margin: 0;
	}
`;
