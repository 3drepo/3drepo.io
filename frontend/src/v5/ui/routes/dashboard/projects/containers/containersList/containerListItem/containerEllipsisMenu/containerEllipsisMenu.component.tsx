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
import { IContainer } from '@/v5/store/containers/containers.types';
import { formatMessage } from '@/v5/services/intl';
import { ContainersActionsDispatchers, DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { EllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';
import { canUploadToBackend } from '@/v5/store/containers/containers.helpers';
import { ticketsSelectionRoute, viewerRoute } from '@/v5/services/routing/routing';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { ContainersHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { prefixBaseDomain } from '@/v5/helpers/url.helper';
import { ContainerSettingsModal } from '../../../containerSettingsModal/containerSettingsModal.component';
import { uploadToContainer } from '../../../uploadFileForm/uploadToContainer.component';

type ContainerEllipsisMenuProps = {
	selected?: boolean,
	container: IContainer,
	onSelectOrToggleItem?: (id: string) => void,
};

export const ContainerEllipsisMenu = ({
	selected,
	container,
	onSelectOrToggleItem,
}: ContainerEllipsisMenuProps) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const hasCollaboratorAccess = ContainersHooksSelectors.selectHasCollaboratorAccess(container._id);

	const onClickShare = () => {
		const link = prefixBaseDomain(viewerRoute(teamspace, project, container));
		const subject = formatMessage({ id: 'shareModal.container.subject', defaultMessage: 'container' });
		const title = formatMessage({ id: 'shareModal.container.title', defaultMessage: 'Share Container' });

		DialogsActionsDispatchers.open('share', {
			name: container.name,
			subject,
			title,
			link,
		});
	};

	// eslint-disable-next-line max-len
	const onClickSettings = () => DialogsActionsDispatchers.open(ContainerSettingsModal, { containerId: container._id });

	const onClickDelete = () => DialogsActionsDispatchers.open('delete', {
		name: container.name,
		onClickConfirm: () => new Promise<void>(
			(accept, reject) => {
				ContainersActionsDispatchers.deleteContainer(
					teamspace,
					project,
					container._id,
					accept,
					reject,
				);
			},
		),
		message: formatMessage({
			id: 'deleteModal.container.message',
			defaultMessage: 'By deleting this Container your data will be lost permanently and will not be recoverable.',
		}),
	});

	return (
		<EllipsisMenu selected={selected}>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'containers.ellipsisMenu.loadContainer',
					defaultMessage: 'Load Container in 3D Viewer',
				})}
				to={viewerRoute(teamspace, project, container)}
				disabled={!container.revisionsCount}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'containers.ellipsisMenu.uploadNewRevision',
					defaultMessage: 'Upload new Revision',
				})}
				onClick={() => uploadToContainer(container._id)}
				disabled={!canUploadToBackend(container.status)}
				hidden={!hasCollaboratorAccess}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'containers.ellipsisMenu.viewTickets',
					defaultMessage: 'View Tickets',
				})}
				to={ticketsSelectionRoute( teamspace, project, container._id)}
			/>
			{onSelectOrToggleItem && (
				<EllipsisMenuItem
					title={formatMessage(selected
						? { id: 'containers.ellipsisMenu.hideRevisions', defaultMessage: 'Hide Revisions' }
						: { id: 'containers.ellipsisMenu.viewRevisions', defaultMessage: 'View Revisions' })}
					onClick={() => onSelectOrToggleItem(container._id)}
				/>
			)}
			<EllipsisMenuItem
				title={formatMessage({
					id: 'containers.ellipsisMenu.editPermissions',
					defaultMessage: 'Edit Permissions',
				})}
				to={{
					pathname: './user_permissions',
					search: `?modelId=${container._id}`,
				}}
				hidden={!isProjectAdmin}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'containers.ellipsisMenu.shareContainer',
					defaultMessage: 'Share Container',
				})}
				onClick={onClickShare}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'containers.ellipsisMenu.settings',
					defaultMessage: 'Settings',
				})}
				onClick={onClickSettings}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'containers.ellipsisMenu.delete',
					defaultMessage: 'Delete',
				})}
				onClick={onClickDelete}
				hidden={!isProjectAdmin}
			/>
		</EllipsisMenu>
	);
};
