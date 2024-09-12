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
export const getErrorMessage = (error: any) => error.response?.data?.message || error.message;
export const getErrorCode = (error: any) => error?.response?.data?.code || '';
export const getErrorStatus = (error: any) => error.response?.status;

export const isInvalidArguments = (error: any): boolean => getErrorCode(error) === 'INVALID_ARGUMENTS';

export const isPasswordIncorrect = (error: any): boolean => getErrorCode(error) === 'INCORRECT_PASSWORD';

export const isFileFormatUnsupported = (error: any): boolean => getErrorCode(error) === 'UNSUPPORTED_FILE_FORMAT';

export const isNotLoggedIn = (error: any): boolean => getErrorCode(error) === 'NOT_LOGGED_IN';

export const isNetworkError = (error: any): boolean => getErrorMessage(error) === 'Network Error';

const fieldAlreadyExists = (error: any, field: string): boolean => {
	const errorMessage = getErrorMessage(error).toLowerCase();
	return errorMessage.includes(field) && (
		errorMessage.includes('already exists')
		|| errorMessage.includes('already used')
	);
};

export const nameAlreadyExists = (error: any): boolean => fieldAlreadyExists(error, 'name');
export const usernameAlreadyExists = (error: any): boolean => fieldAlreadyExists(error, 'username');
export const emailAlreadyExists = (error: any): boolean => fieldAlreadyExists(error, 'email');
export const projectAlreadyExists = (error: any): boolean => fieldAlreadyExists(error, 'project');
export const numberAlreadyExists = (error: any): boolean => fieldAlreadyExists(error, 'number');

export const isPathNotFound = (error): boolean => getErrorStatus(error) === 404;
export const isPathNotAuthorized = (error): boolean => getErrorCode(error).endsWith('NOT_AUTHORIZED');

export const isProjectNotFound = (code: string): boolean => code === 'PROJECT_NOT_FOUND';
export const isModelNotFound = (code: string): boolean => ['RESOURCE_NOT_FOUND', 'CONTAINER_NOT_FOUND'].includes(code);

export const isContainerPartOfFederation = (error): boolean => getErrorCode(error).endsWith('CONTAINER_IS_SUB_MODEL');
