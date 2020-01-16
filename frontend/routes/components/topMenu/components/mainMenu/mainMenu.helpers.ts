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

export interface ICurrentUser {
	username: string;
	avatarUrl: string;
	firstName: string;
	lastName: string;
}

export interface IUserData {
	name: string;
	username: string;
	avatarUrl: string;
}

export const getNormalizedUserData = ({ username, avatarUrl, firstName, lastName }: ICurrentUser): IUserData => {
	const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : username;

	return {
		name,
		username,
		avatarUrl,
	};
};
