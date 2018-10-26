/**
 *  Copyright (C) 2018 3D Repo Ltd
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
import { ListItem, Toolbar, ListItemSecondaryAction, Avatar, ListItemText } from '@material-ui/core';

export const NotificationListItem = styled(ListItem)`
	&& {
		padding: 9px;
	}
`;

export const NotificationListItemText = styled(ListItemText)`
	${NotificationListItem}:hover & {
		width:  0px;
	}
`;

export const NotificationListItemSecondaryAction = styled.div`
	visibility: hidden;
	width:0px;
	height:40px;
	overflow:hidden;

	${NotificationListItem}:hover & {
		visibility: inherit ;
		width:75px;
	}
`;
