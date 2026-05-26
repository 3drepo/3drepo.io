/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { getState } from '@/v5/helpers/redux.helpers';
import { formatMessage } from '@/v5/services/intl';
import { selectCurrentTeamspaceUsersByIds } from '@/v5/store/users/users.selectors';

const UNKNOWN_USER = formatMessage({ id: 'v4.unknownUser', defaultMessage: 'Unknown user' });

export const getUserLastName = (username) => {
	const user = selectCurrentTeamspaceUsersByIds(getState())[username];
	return (!user || user?.isNotTeamspaceMember) ? UNKNOWN_USER : user.lastName;
};

export const getUserFullName = (username) => {
	const user = selectCurrentTeamspaceUsersByIds(getState())[username];
	return (!user || user?.isNotTeamspaceMember) ? UNKNOWN_USER : `${user.firstName} ${user.lastName}`;
};