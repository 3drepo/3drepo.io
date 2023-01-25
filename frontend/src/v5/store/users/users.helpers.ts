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
import { formatMessage } from '@/v5/services/intl';
import { IUser } from './users.redux';

export const getMemberImgSrc = (teamspace: string, member: string) => (
	generateV5ApiUrl(`teamspaces/${teamspace}/members/${member}/avatar`, clientConfigService.GET_API)
);

export const USER_NOT_FOUND = {
	firstName: formatMessage({ id: 'user.notFound.firstName', defaultMessage: 'User' }),
	lastName: formatMessage({ id: 'user.notFound.lastName', defaultMessage: 'not found' }),
} as IUser;
