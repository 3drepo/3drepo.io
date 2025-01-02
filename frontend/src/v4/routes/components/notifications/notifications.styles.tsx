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

import { List } from '@mui/material';
import Notifications from '@mui/icons-material/Notifications';
import { COLOR } from '../../../styles';
import { NotificationsPanelHeader } from './components/panelHeader/panelHeader.component';

export const NotificationsList = styled(List)`
	&& {
		height: 100%;
		width: 300px;
	}
`;

export const NotificationsIcon = styled(Notifications)`
	&& {
		color: ${COLOR.WHITE};
		font-size: 24px;
		filter: drop-shadow(0 0 2px ${COLOR.BLACK_30});
	}
`;

export const NotificationsIconContainer = styled.div`
	cursor: pointer;
	padding: 10px;

	.MuiBadge-root {
		margin-top: -2px;
		margin-left: -.4px;
	}
`;

export const NotificationWeekHeader = styled(NotificationsPanelHeader)`
	padding-bottom: 0;
`;
