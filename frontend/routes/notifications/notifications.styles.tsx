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

import { ListItem, ListItemText, Paper, List} from '@material-ui/core';
import { PaperProps } from '@material-ui/core/Paper';
import styled from 'styled-components';
import * as React from 'react';
import Badge, { BadgeProps } from '@material-ui/core/Badge';

export const NotificationListItem = styled(ListItem)`
	&& {
		padding: 6px;
	}
`;

export const NotificationListItemText = styled(ListItemText)`
	&& {
		padding: 0px;
		margin-left: 9px;
	}

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

export const NotificationsPanelItem = styled(ListItem)`
	&& {
		padding-left: 5px;
		padding-right: 5px;
		padding-bottom: 5px;
		padding-top: 0px;
		width: 100%;
		display: block;
	}
`;

export const NotificationsPanelHeaderContainer = styled.div`
	&& {
		display: flex;
		justify-content: space-between;
		padding-left: 2px;
		padding-right: 2px;
	}
`;

export const NotificationItemContainer = styled< {read: boolean} & PaperProps>
	(({read, ...rest}) => (<Paper {...rest}/>))`
  backgroundColor: ${(props) => props.read ? 'transparent' : 'white'};
  margin:3px;
`;

export const NotificationsList = styled(List)`
	&& {
		height: 100%;
		width: 300px;
	}
`;

export const NotificationsBadge = styled(Badge)`
	&&{
		margin-right: 10px;
		margin-top: 2px;
	}
`;
