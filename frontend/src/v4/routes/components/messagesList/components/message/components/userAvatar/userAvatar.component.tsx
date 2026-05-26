/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { useState, useEffect } from 'react';

import { isEmpty, memoize } from 'lodash';
import { getUserFullName } from '@/v4/helpers/user.helpers';
import { renderWhenTrueOtherwise } from '../../../../../../../helpers/rendering';
import { getCheckedAvatarUrl } from '../../../../../../../services/api';
import { Avatar } from './userAvatar.styles';

const getMemoizedAvatarUrl = memoize(getCheckedAvatarUrl);

const getInitials = (name) => name.split(' ').slice(0, 2).map((text) => text[0]).join('').trim().toUpperCase();

const avatarUrl = (name) => getMemoizedAvatarUrl(name);

interface IProps {
	name: string;
	currentUser?: any;
}

export const UserAvatar = ({ name, currentUser }: IProps) => {
	const [url, setUrl] = useState(null);

	const initials = getInitials(getUserFullName(currentUser?.username || name));

	useEffect(() => {
		(async () => {
			const avatarCheckedUrl = await avatarUrl(name);
			setUrl(avatarCheckedUrl);
		})();
	}, [name]);

	return (
		<>
			{!currentUser && <Avatar>{initials}</Avatar>}
			{currentUser && renderWhenTrueOtherwise(
				() => <Avatar src={url} color={currentUser.job && currentUser.job.color} />,
				() => <Avatar color={currentUser.job && currentUser.job.color}>{initials}</Avatar>
			)(!isEmpty(url))}
		</>
	);
};
