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

import { groupBy, keys, values } from 'lodash';
import { createSelector } from 'reselect';
import { selectIssues, selectIssuesMap } from '../issues';
import { selectRisks } from '../risks';
import { BOARD_TYPES } from './board.constants';

export const selectBoardDomain = (state) => ({...state.board});

export const selectFilterProp = createSelector(
	selectBoardDomain, (state) => state.filterProp
);

export const selectLanes = createSelector(
	selectBoardDomain,
	selectIssues,
	selectRisks,
	({ filterProp, boardType }, issues, risks) => {
		const lanes = [];
		const dataMap = {
			[BOARD_TYPES.ISSUES]: issues,
			[BOARD_TYPES.RISKS]: risks
		};
		const preparedData = issues.map((issue, index) => {
			return {
				id: issue._id,
				[filterProp]: issue[filterProp],
				metadata: {
					...issue
				}
			};
		});
		const groups = values(groupBy(preparedData, filterProp));
		const groupsKeys = keys(groupBy(dataMap[boardType], filterProp));

		for (let i = 0 ; i < groups.length; i++) {
			const lane = {} as any;
			lane.id = groupsKeys[i];
			lane.title = `${groupsKeys[i]} ${filterProp}`;
			lane.label = 'label test';
			lane.cards = groups[i];
			lanes.push(lane);
		}

		return lanes;
	}
);
