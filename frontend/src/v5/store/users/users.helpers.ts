/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { clientConfigService } from '@/v4/services/clientConfig';
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { ICurrentUser } from '../currentUser/currentUser.types';
import { IUser } from './users.redux';
import { formatMessage } from '@/v5/services/intl';

export const getMemberImgSrc = (teamspace: string, member: string) => (
	generateV5ApiUrl(`teamspaces/${teamspace}/members/${member}/avatar`, clientConfigService.GET_API)
);

export const getUserInitials = ({ firstName, lastName }: ICurrentUser | IUser) => {
	if (!(firstName || lastName)) return '';
	return [firstName, lastName]
		.map((name) => name.trim().charAt(0).toUpperCase())
		.join('');
};

export const USER_NOT_FOUND_NAME = formatMessage({
	id: 'user.nonexistentUser.name',
	defaultMessage: 'Unknown User',
});
export const JOB_OR_USER_NOT_FOUND_NAME = formatMessage({
	id: 'user.nonexistentJobOrUser.name',
	defaultMessage: 'Unknown User/Job',
});
export const JOB_OR_USER_NOT_FOUND_MESSAGE = formatMessage({
	id: 'user.nonexistentJobOrUser.message',
	defaultMessage: 'The user/job could not be found in this teamspace',
});

export const getDefaultUserNotFound = (name: string): IUser => ({
	firstName: USER_NOT_FOUND_NAME,
	lastName: '',
	avatarUrl: '',
	user: name,
});

export const getImportedUser = (name: string): IUser => ({
	firstName: name,
	lastName: '',
	avatarUrl: '',
	user: name,
});

export const userHasMissingRequiredData = ({ lastName }: ICurrentUser) => !lastName;

export const getFullnameFromUser = (user: IUser) => `${user.firstName} ${user.lastName}`;

// if an assignee has an _id that means it is a job, so we return this _id instead of getting fullname
export const getAssigneeDisplayName = (assignee) => assignee?._id ?? getFullnameFromUser(assignee);
