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

export interface ICurrentUser {
	username: string,
	firstName: string,
	lastName: string,
	email: string,
	hasAvatar?: boolean,
	apiKey?: string,
	company?: string,
	countryCode?: string,
	avatarUrl?: string,
	intercomRef?: string,
	apiKeyIsUpdating?: boolean,
}

export type UpdatePersonalData = Partial<Pick<ICurrentUser, 'firstName' | 'lastName' | 'company' >> & {
	avatarFile?: File,
};

export type UpdateApiKey = Pick<ICurrentUser, 'apiKey'>;

export type UpdateUser = UpdatePersonalData | UpdateApiKey;

export type UpdateUserSuccess = Partial<ICurrentUser>;

export enum Role {
	ADMIN = 'admin',
	COLLABORATOR = 'collaborator',
	COMMENTER = 'commenter',
	VIEWER = 'viewer',
	NONE = 'none',
}
