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
import { EllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';
import { IFederation } from '@/v5/store/federations/federations.types';
import { FederationsActionsDispatchers, DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ticketsSelectionRoute, viewerRoute } from '@/v5/services/routing/routing';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { FederationsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { prefixBaseDomain } from '@/v5/helpers/url.helper';
import { FederationSettingsModal } from '../../../federationSettingsModal/federationSettingsModal.component';

type FederationEllipsisMenuProps = {
	federation: IFederation,
	onClickEdit: () => void,
};

export const FederationEllipsisMenu = ({
	federation,
	onClickEdit,
}: FederationEllipsisMenuProps) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const isReadOnly = !FederationsHooksSelectors.selectHasCommenterAccess(federation._id);

	const onClickSettings = () => DialogsActionsDispatchers.open(FederationSettingsModal, { federationId: federation._id });

	const onClickShare = () => {
		const link = prefixBaseDomain(viewerRoute(teamspace, project, federation));
		const subject = formatMessage({ id: 'shareModal.federation.subject', defaultMessage: 'federation' });
		const title = formatMessage({ id: 'shareModal.federation.title', defaultMessage: 'Share Federation' });

		DialogsActionsDispatchers.open('share', {
			name: federation.name,
			subject,
			title,
			link,
		});
	};

	const onClickDelete = () => {
		DialogsActionsDispatchers.open('delete', {
			name: federation.name,
			onClickConfirm: () => new Promise<void>(
				(accept, reject) => {
					FederationsActionsDispatchers.deleteFederation(
						teamspace,
						project,
						federation._id,
						accept,
						reject,
					);
				},
			),
			message: formatMessage({
				id: 'deleteFederation.federation.message',
				defaultMessage: 'By deleting this Federation your data will be lost permanently and will not be recoverable.',
			}),
		});
	};

	return (
		<EllipsisMenu>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.loadFederation',
					defaultMessage: 'Load Federation in 3D Viewer',
				})}
				to={viewerRoute(teamspace, project, federation)}
			/>

			<EllipsisMenuItem
				title={isReadOnly ? formatMessage({
					id: 'federations.ellipsisMenu.view',
					defaultMessage: 'View Federation',
				}) : formatMessage({
					id: 'federations.ellipsisMenu.edit',
					defaultMessage: 'Edit Federation',
				})}
				onClick={onClickEdit}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.viewTickets',
					defaultMessage: 'View Tickets',
				})}
				to={{ pathname: ticketsSelectionRoute(
					teamspace,
					project,
					federation._id,
				) }}
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
				hidden={!isProjectAdmin}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.shareFederation',
					defaultMessage: 'Share Federation',
				})}
				onClick={onClickShare}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.settings',
					defaultMessage: 'Settings',
				})}
				onClick={onClickSettings}
			/>

			<EllipsisMenuItem
				title={formatMessage({
					id: 'federations.ellipsisMenu.delete',
					defaultMessage: 'Delete',
				})}
				onClick={onClickDelete}
				hidden={!isProjectAdmin}
			/>
		</EllipsisMenu>
	);
};
