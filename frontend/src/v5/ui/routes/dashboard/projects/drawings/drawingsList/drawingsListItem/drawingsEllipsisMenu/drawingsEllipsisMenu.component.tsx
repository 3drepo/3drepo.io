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
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { EllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';

type DrawingsEllipsisMenuProps = {
	selected?: boolean,
	drawing: any, // TODO - add drawing type
	onSelectOrToggleItem?: (id: string) => void,
};

export const DrawingsEllipsisMenu = ({
	selected,
	drawing,
	onSelectOrToggleItem,
}: DrawingsEllipsisMenuProps) => {
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const hasCollaboratorAccess = true; // TODO Add permision selector

	const onClickSettings = () => { }; // TODO - add drawing settings modal

	const onClickDelete = () => DialogsActionsDispatchers.open('delete', {
		name: drawing.name,
		onClickConfirm: () => new Promise<void>(
			() => { }, // TODO - add actual delete drawing call
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
					id: 'drawings.ellipsisMenu.calibrate',
					defaultMessage: 'Calibrate',
				})}
				onClick={() => { }} // TODO - add calibration functionality
				disabled={!drawing.total}
				hidden={!hasCollaboratorAccess}
			/>
			<EllipsisMenuItem
				title={formatMessage({
					id: 'drawings.ellipsisMenu.settings',
					defaultMessage: 'Settings',
				})}
				onClick={onClickSettings}
			/>
			{onSelectOrToggleItem && (
				<EllipsisMenuItem
					title={formatMessage(selected
						? { id: 'drawings.ellipsisMenu.hideRevisions', defaultMessage: 'Hide Revisions' }
						: { id: 'drawings.ellipsisMenu.viewRevisions', defaultMessage: 'View Revisions' })}
					onClick={() => onSelectOrToggleItem(drawing._id)}
				/>
			)}
			<EllipsisMenuItem
				title={formatMessage({
					id: 'drawings.ellipsisMenu.upload',
					defaultMessage: 'Upload',
				})}
				onClick={() => { }} // TODO - add upload modal call
				hidden={!hasCollaboratorAccess}
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
