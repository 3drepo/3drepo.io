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
export const isInvalidArguments = (error: any): boolean => error.response.data.code === 'INVALID_ARGUMENTS';

export const usernameAlreadyExists = (error: string): boolean => error.toLowerCase().includes('username already exists');

export const emailAlreadyExists = (error: string): boolean => error.toLowerCase().includes('email already exists');

export const getRegistrationErrorMessage = (error: any) => {
	const { data } = error.response;
	if (data.message) return data.message;
	const [, message] = data.split(/<\/?pre>/);
	return message;
};

export const getVerifyCaptchaErrorMessage = (error: any) => error.response.data.message;
