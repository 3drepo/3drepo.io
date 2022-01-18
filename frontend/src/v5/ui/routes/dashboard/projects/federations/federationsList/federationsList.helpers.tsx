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

import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { formatMessage } from '@/v5/services/intl';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { IFederation } from '@/v5/store/federations/federations.types';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';

export const getFederationMenuItems = (federation: IFederation) => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const dispatch = useDispatch();

	return [
		{
			key: 1,
			title: formatMessage({ id: 'federations.ellipsisMenu.loadFederation', defaultMessage: 'Load Federation in 3D Viewer' }),
			to: `/${federation._id}`,
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
			onClick: () => {
				dispatch(DialogsActions.open('delete', {
					title: formatMessage(
						{ id: 'deleteFederation.federation.title', defaultMessage: 'Delete {name}?' },
						{ name: federation.name },
					),
					onClickConfirm: () => FederationsActionsDispatchers.deleteFederation(
						teamspace,
						project,
						federation._id,
					),
					message: formatMessage({
						id: 'deleteFederation.federation.message',
						defaultMessage: 'By deleting this Federation your data will be lost permanently and will not be recoverable.',
					}),
				}));
			},
		},
	];
};
