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

import { createSelector } from 'reselect';
import { IRevisionsState } from './revisions.types';

const selectRevisionsDomain = (state: { revisions: IRevisionsState }) => state.revisions;
const selectContainerIdParam = (_, containerId: string) => containerId;

export const selectRevisions = createSelector(
	selectRevisionsDomain,
	selectContainerIdParam,
	(state, containerId) => state.revisions[containerId] || [],
);

export const selectIsPending: (any, string) => boolean = createSelector(
	selectRevisionsDomain,
	selectContainerIdParam,
	(state, containerId) => state.isPending[containerId],
);
