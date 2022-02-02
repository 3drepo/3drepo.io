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
import React, { MouseEvent } from 'react';
import { useParams } from 'react-router';
import { IContainer } from '@/v5/store/containers/containers.types';
import { formatMessage } from '@/v5/services/intl';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { useDispatch } from 'react-redux';
import { Tooltip } from '@material-ui/core';
import { EllipsisButton } from '@controls/ellipsisButton';
import { EllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';

type IContainerEllipsisMenu = {
	selected: boolean,
	container: IContainer,
	onSelectOrToggleItem: (id: string) => void,
	openShareModal: () => void,
};

export const ContainerEllipsisMenu = ({
	selected,
	container,
	onSelectOrToggleItem,
	openShareModal,
}: IContainerEllipsisMenu) => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const dispatch = useDispatch();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClickDropdown = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleCloseDropdown = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<Tooltip title={formatMessage({ id: 'ellipsisMenu.tooltip', defaultMessage: 'More options' })}>
				<EllipsisButton
					aria-controls="ellipsis-menu-list"
					aria-haspopup="true"
					onClick={(event) => {
						event.stopPropagation();
						handleClickDropdown(event);
					}}
					isOn={Boolean(anchorEl)}
				/>
			</Tooltip>
			<EllipsisMenu
				handleClose={handleCloseDropdown}
				anchorEl={anchorEl}
			>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.loadContainer',
						defaultMessage: 'Load Container in 3D Viewer',
					})}
					to=""
					onClick={() => { }}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.loadContainer',
						defaultMessage: 'Load Container in 3D Viewer',
					})}
					to={`/${container._id}`}
					onClick={() => { }}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.uploadNewRevision',
						defaultMessage: 'Upload new Revision',
					})}
					to=""
					onClick={() => { }}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.viewIssues',
						defaultMessage: 'View Issues',
					})}
					to=""
					onClick={() => { }}
					handleClose={handleCloseDropdown}

				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.viewRisks',
						defaultMessage: 'View Risks',
					})}
					to=""
					onClick={() => { }}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage(selected
						? { id: 'containers.ellipsisMenu.hideRevisions', defaultMessage: 'Hide Revisions' }
						: { id: 'containers.ellipsisMenu.viewRevisions', defaultMessage: 'View Revisions' })}
					to=""
					onClick={() => onSelectOrToggleItem(container._id)}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.editPermissions',
						defaultMessage: 'Edit Permissions',
					})}
					to=""
					onClick={() => { }}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.shareContainer',
						defaultMessage: 'Share Container',
					})}
					to=""
					onClick={openShareModal}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.settings',
						defaultMessage: 'Settings',
					})}
					to=""
					onClick={() => { }}
					handleClose={handleCloseDropdown}
				/>
				<EllipsisMenuItem
					title={formatMessage({
						id: 'containers.ellipsisMenu.delete',
						defaultMessage: 'Delete',
					})}
					to=""
					onClick={() => dispatch(DialogsActions.open('delete', {
						title: formatMessage(
							{ id: 'deleteModal.container.title', defaultMessage: 'Delete {name}?' },
							{ name: container.name },
						),
						onClickConfirm: () => ContainersActionsDispatchers.deleteContainer(
							teamspace,
							project,
							container._id,
						),
						message: formatMessage({
							id: 'deleteModal.container.message',
							defaultMessage: 'By deleting this Container your data will be lost permanently and will not be recoverable.',
						}),
					}))}
					handleClose={handleCloseDropdown}
				/>
			</EllipsisMenu>
		</>
	);
};
