/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { IFederation } from '@/v5/store/federations/federations.types';

export const getFederationMenuItems = (id: IFederation['_id']) => [
	{
		key: 1,
		title: formatMessage({ id: 'federations.ellipsisMenu.loadFederation', defaultMessage: 'Load Federation in 3D Viewer' }),
		to: `/${id}`,
	},
	{
		key: 2,
		title: formatMessage({ id: 'federations.ellipsisMenu.edit', defaultMessage: 'Edit Federation' }),
		onClick: () => { },
	},
	{
		key: 3,
		title: formatMessage({ id: 'federations.ellipsisMenu.viewIssues', defaultMessage: 'View Issues' }),
		onClick: () => { },
	},
	{
		key: 4,
		title: formatMessage({ id: 'federations.ellipsisMenu.viewRisks', defaultMessage: 'View Risks' }),
		onClick: () => { },
	},
	{
		key: 5,
		title: formatMessage({ id: 'federations.ellipsisMenu.editPermissions', defaultMessage: 'Edit Permissions' }),
		onClick: () => { },
	},
	{
		key: 6,
		title: formatMessage({ id: 'federations.ellipsisMenu.shareContainer', defaultMessage: 'Share Container' }),
		onClick: () => { },
	},
	{
		key: 7,
		title: formatMessage({ id: 'federations.ellipsisMenu.settings', defaultMessage: 'Settings' }),
		onClick: () => {
		},
	},
	{
		key: 8,
		title: formatMessage({ id: 'federations.ellipsisMenu.delete', defaultMessage: 'Delete' }),
		onClick: () => { },
	},
];
