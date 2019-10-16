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

import { groupBy, keys, keyBy, values } from 'lodash';
import { createSelector } from 'reselect';
import { PRIORITIES, STATUSES } from '../../constants/issues';
import { selectIssues, selectIssuesMap } from '../issues';
import { selectJobs } from '../jobs';
import { selectTopicTypes } from '../model';
import { selectRisks } from '../risks';
import { selectUsers } from '../userManagement';
import { BOARD_TYPES, FILTER_PROPS } from './board.constants';

export const selectBoardDomain = (state) => ({...state.board});

export const selectIsPending = createSelector(
	selectBoardDomain, (state) => state.isPending
);

export const selectFilterProp = createSelector(
	selectBoardDomain, (state) => state.filterProp
);

export const selectBoardType = createSelector(
	selectBoardDomain, (state) => state.boardType
);

export const selectFetchedTeamspace = createSelector(
	selectBoardDomain, (state) => state.teamspace
);

export const selectLanes = createSelector(
	selectBoardDomain,
	selectIssues,
	selectRisks,
	selectTopicTypes,
	selectJobs,
	selectUsers,
	({ filterProp, boardType }, issues, risks, topicTypes, jobs, users) => {
		const filtersMap = {
			[FILTER_PROPS.status.value]: STATUSES,
			[FILTER_PROPS.priority.value]: PRIORITIES,
			[FILTER_PROPS.topic_type.value]: Object.assign({}, ...topicTypes.map((t) => ({[t.value]: t.label}))),
			[FILTER_PROPS.owner.value]: Object.assign({}, ...users.map((u) => ({[u.user]: `${u.firstName}`}))),
			[FILTER_PROPS.assigned_roles.value]: Object.assign({}, ...jobs.map((j) => ({[j._id]: j._id})))
		};
		const lanes = [];
		const dataMap = {
			[BOARD_TYPES.ISSUES]: issues,
			[BOARD_TYPES.RISKS]: risks
		};
		const preparedData = dataMap[boardType].map((item) => {
			return {
				id: item._id,
				[filterProp]: item[filterProp],
				metadata: { ...item }
			};
		});

		const groups = values(groupBy(preparedData, filterProp));
		const isPrefixTitle = filterProp === FILTER_PROPS.owner.value || filterProp === FILTER_PROPS.assigned_roles.value;
		const name = FILTER_PROPS[filterProp].name;
		const dataset = filtersMap[filterProp];

		for (let i = 0 ; i < values(dataset).length; i++) {
			const lane = {} as any;
			lane.id = keys(dataset)[i];
			lane.title = isPrefixTitle ? `${name} ${keys(dataset)[i]}` : `${keys(dataset)[i]} ${name}`;
			lane.label = `${groups[i] ? groups[i].length : 0} ${boardType}`;
			lane.cards = groups[i] ? groups[i] : [];
			lanes.push(lane);
		}

		return lanes;
	}
);
