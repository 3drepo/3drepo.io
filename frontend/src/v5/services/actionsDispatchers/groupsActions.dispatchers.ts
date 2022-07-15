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
import { GroupsActions } from '@/v4/modules/groups';
import { createActionsDispatchers } from '@/v5/helpers/actionsDistpatchers.helper';
import { Action } from 'redux';

interface IGroupsActionCreators {
	setColorOverrides: (groupIds: string[], on: boolean) => Action;
	isolateGroups: (groupIds: string[]) => Action;
}

export const GroupsActionsDispatchers = createActionsDispatchers<IGroupsActionCreators>(GroupsActions);
