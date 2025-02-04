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
import { DialogsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { EllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';
import { DrawingsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { EditDrawingDialog } from '../../../drawingDialogs/editDrawingDialog.component';
import { uploadToDrawing } from '../../../uploadDrawingRevisionForm/uploadDrawingRevisionForm.helpers';
import { SelectModelForCalibration } from '../selectModelForCalibration/selectModelForCalibration.component';
import { canUploadToBackend } from '@/v5/store/drawings/drawings.helpers';

type DrawingsEllipsisMenuProps = {
	selected?: boolean,
	drawing: IDrawing,
	onSelectOrToggleItem?: (id: string) => void,
};

export const DrawingsEllipsisMenu = ({
	selected,
	drawing,
	onSelectOrToggleItem,
}: DrawingsEllipsisMenuProps) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const drawingId = drawing._id;
	const hasCollaboratorAccess = DrawingsHooksSelectors.selectHasCollaboratorAccess(drawingId);

	const onCalibrateClick = () => DialogsActionsDispatchers.open(SelectModelForCalibration, { drawingId });

	const onClickSettings = () => DialogsActionsDispatchers.open(EditDrawingDialog, { drawingId });
	
	const onClickDelete = () => DialogsActionsDispatchers.open('delete', {
		name: drawing.name,
		onClickConfirm: () => new Promise<void>(
			(accept, reject) => DrawingsActionsDispatchers.deleteDrawing(
				teamspace,
				project,
				drawingId,
				accept,
				reject,
			),
		),
		message: formatMessage({
			id: 'deleteModal.drawing.message',
			defaultMessage: 'By deleting this Drawing your data will be lost permanently and will not be recoverable.',
		}),
	});

	return (
		<EllipsisMenu selected={selected}>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'drawings.ellipsisMenu.upload',
					defaultMessage: 'Upload new revision',
				})}
				onClick={() => uploadToDrawing(drawingId)}
				disabled={!canUploadToBackend(drawing.status)}
				hidden={!hasCollaboratorAccess}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'drawings.ellipsisMenu.calibrate',
					defaultMessage: 'Calibrate latest revision',
				})}
				onClick={onCalibrateClick}
				disabled={!drawing.revisionsCount}
				hidden={!hasCollaboratorAccess}
			/>
			{onSelectOrToggleItem && (
				<EllipsisMenuItem
					title={formatMessage(selected
						? { id: 'drawings.ellipsisMenu.hideRevisions', defaultMessage: 'Hide Revisions' }
						: { id: 'drawings.ellipsisMenu.viewRevisions', defaultMessage: 'View Revisions' })}
					onClick={() => onSelectOrToggleItem(drawingId)}
				/>
			)}
			<EllipsisMenuItem
				title={formatMessage({
					id: 'drawings.ellipsisMenu.editPermissions',
					defaultMessage: 'Edit Permissions',
				})}
				to={{
					pathname: './user_permissions',
					search: `?modelId=${drawingId}`,
				}}
				hidden={!isProjectAdmin}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'drawings.ellipsisMenu.settings',
					defaultMessage: 'Settings',
				})}
				onClick={onClickSettings}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'drawings.ellipsisMenu.delete',
					defaultMessage: 'Delete',
				})}
				onClick={onClickDelete}
				hidden={!isProjectAdmin}
			/>
		</EllipsisMenu>
	);
};
