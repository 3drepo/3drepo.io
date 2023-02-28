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
import { formatMessage } from '@/v5/services/intl';
import { uniqWith, isArray, isEqual } from 'lodash';
import { IContainer } from './containers/containers.types';
import { Role } from './currentUser/currentUser.types';
import { IFederation } from './federations/federations.types';
import { View } from './store.types';

type CF = IContainer | IFederation;
export const EMPTY_VIEW: View = {
	_id: ' ',
	name: 'None',
	hasThumbnail: false,
};

export const uniqueIds = <T>(listItems: T[]) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	uniqWith(listItems, (a, b) => (a as unknown as CF)._id === (b as unknown as CF)._id);

export const compByColum = (columns: string[]) => (a, b) => {
	if (isArray(a) || isArray(b)) return undefined;
	if (a === undefined || b === undefined) return undefined;
	return columns.every((col) => isEqual(a[col], b[col]));
};

export const RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE = formatMessage({
	id: 'error.details.reloadPageOrContactSupport',
	defaultMessage: 'If reloading the page doesn\'t work please contact support',
});

export const formattedContainerText = formatMessage({
	id: 'container',
	defaultMessage: 'container',
});

export const formattedFederationText = formatMessage({
	id: 'federation',
	defaultMessage: 'federation',
});

export const getContainerOrFederationFormattedText = (isFederation) => (
	isFederation ? formattedFederationText : formattedContainerText
);

export const isCollaboratorRole = (role: Role): boolean => [Role.ADMIN, Role.COLLABORATOR].includes(role);
export const isCommenterRole = (role: Role): boolean => [Role.ADMIN, Role.COLLABORATOR, Role.COMMENTER].includes(role);
