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
import { useParams } from 'react-router';
import { formatMessage } from '@/v5/services/intl';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { useDispatch } from 'react-redux';
import { EllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';
import { IFederation } from '@/v5/store/federations/federations.types';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { viewerRoute } from '@/v5/services/routing/routing';

type FederationEllipsisMenuProps = {
	federation: IFederation,
	openFederationSettings: () => void,
	openShareModal: () => void,
	openEditFederationModal: () => void,
};

export const FederationEllipsisMenu = ({
	federation,
	openFederationSettings,
	openShareModal,
	openEditFederationModal,
}: FederationEllipsisMenuProps) => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const dispatch = useDispatch();

	return (
		<EllipsisMenu>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.loadFederation',
					defaultMessage: 'Load Federation in 3D Viewer',
				})}
				to={viewerRoute(teamspace, federation)}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.edit',
					defaultMessage: 'Edit Federation',
				})}
				onClick={openEditFederationModal}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.viewIssues',
					defaultMessage: 'View Issues',
				})}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.viewRisks',
					defaultMessage: 'View Risks',
				})}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.editPermissions',
					defaultMessage: 'Edit Permissions',
				})}
				to={{
					pathname: './user_permissions',
					search: `?modelId=${federation._id}`,
				}}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.shareFederation',
					defaultMessage: 'Share Federation',
				})}
				onClick={openShareModal}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.settings',
					defaultMessage: 'Settings',
				})}
				onClick={openFederationSettings}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.delete',
					defaultMessage: 'Delete',
				})}
				onClick={() => {
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
				}}
			/>
		</EllipsisMenu>
	);
};
