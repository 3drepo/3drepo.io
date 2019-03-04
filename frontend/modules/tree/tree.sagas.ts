/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { put, takeLatest, select } from 'redux-saga/effects';
import { TreeTypes, TreeActions } from './tree.redux';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { dispatch, getAngularService } from '../../helpers/migration';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { selectSelectedNodes } from './tree.selectors';
import { GroupsActions } from '../groups';

export function* startListenOnSelections() {
	try {
		const selectedNodes = yield select(selectSelectedNodes);
		const objectsStatus = yield Viewer.getObjectsStatus();
		const TreeService = getAngularService('TreeService') as any;

		Viewer.on(VIEWER_EVENTS.OBJECT_SELECTED, (object) => {
			TreeService.nodesClickedByIds([object.id]);

			const isAccumMode = MultiSelect.isAccumMode();
			const isDeccumMode = MultiSelect.isDecumMode();
			const multiSelectMode = isAccumMode || isDeccumMode;

			if (!multiSelectMode) {
				dispatch(TreeActions.clearSelectedNodes());
				dispatch(TreeActions.addSelectedNode(object.id));
			}

			if (isDeccumMode) {
				dispatch(TreeActions.removeSelectedNode(object.id));
			} else if (isAccumMode) {
				dispatch(TreeActions.addSelectedNode(object.id));
			}
		});

		Viewer.on(VIEWER_EVENTS.MULTI_OBJECTS_SELECTED, (object) => {
			TreeService.nodesClickedBySharedIds(object.selectedNodes);
		});

		Viewer.on(VIEWER_EVENTS.BACKGROUND_SELECTED, () => {
			TreeService.clearCurrentlySelected();

			if (Object.keys(selectedNodes).length) {
				dispatch(TreeActions.clearSelectedNodes());
				dispatch(GroupsActions.clearSelectionHighlights());
			}
		});
	} catch (error) {
		console.error(error);
	}
}

export function* stopListenOnSelections() {
	try {
		Viewer.off(VIEWER_EVENTS.OBJECT_SELECTED);
		Viewer.off(VIEWER_EVENTS.MULTI_OBJECTS_SELECTED);
		Viewer.off(VIEWER_EVENTS.BACKGROUND_SELECTED);
	} catch (error) {
		console.error(error);
	}
}

export default function* TreeSaga() {
	yield takeLatest(TreeTypes.START_LISTEN_ON_SELECTIONS, startListenOnSelections);
	yield takeLatest(TreeTypes.STOP_LISTEN_ON_SELECTIONS, stopListenOnSelections);
}
