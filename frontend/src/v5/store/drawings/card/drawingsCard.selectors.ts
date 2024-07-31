/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { selectCalibratedDrawings } from '../drawings.selectors';
import { IDrawingsCardState } from './drawingsCard.redux';
import { pick } from 'lodash';

const selectDrawingsCardDomain = (state): IDrawingsCardState => state.drawingsCard || {};

export const selectQueries = createSelector(
	selectDrawingsCardDomain,
	(drawingCardState) => drawingCardState.queries || [],
);

export const selectDrawingsFilteredByQueries = createSelector(
	selectCalibratedDrawings,
	selectQueries,
	(drawings, queries) => drawings.filter((drawing) => {
		if (!queries.length) return true;

		const fields = Object.values(pick(drawing, ['desc', 'drawingNumber', 'name', 'latestRevision.statusCode', 'latestRevision.revisionCode']));

		const drawingMatchesQuery = (query) => fields.some((str) => str.toLowerCase().includes(query.toLowerCase()));
		return queries.some(drawingMatchesQuery);
	}),
);
