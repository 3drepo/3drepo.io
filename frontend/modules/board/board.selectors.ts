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

import { groupBy, values } from 'lodash';
import { createSelector } from 'reselect';
import { PRIORITIES, STATUSES } from '../../constants/issues';
import { selectIssues, selectFilteredIssues } from '../issues';
import { selectJobs } from '../jobs';
import { selectTopicTypes } from '../model';
import { selectRisks, selectFilteredRisks } from '../risks';
import { selectUsers } from '../userManagement';
import { BOARD_TYPES, FILTER_PROPS, NOT_DEFINED_PROP } from './board.constants';

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

export const selectSearchEnabled = createSelector(
	selectBoardDomain, (state) => state.searchEnabled
);

export const selectSortOrder = createSelector(
	selectBoardDomain, (state) => state.sortOrder
);

export const selectLanes = createSelector(
	selectBoardDomain,
	selectFilteredIssues,
	selectFilteredRisks,
	selectTopicTypes,
	selectJobs,
	selectUsers,
	({ filterProp, boardType }, issues, risks, topicTypes, jobs, users) => {
		const filtersMap = {
			[FILTER_PROPS.status.value]: STATUSES,
			[FILTER_PROPS.priority.value]: PRIORITIES,
			[FILTER_PROPS.topic_type.value]: Object.assign({}, ...topicTypes.map((t) => ({[t.value]: t.value}))),
			[FILTER_PROPS.owner.value]: Object.assign({}, ...users.map((u) => ({[u.user]: `${u.user}`}))),
			[FILTER_PROPS.assigned_roles.value]: Object.assign({}, ...jobs.map((j) => ({[j._id]: j._id})))
		};
		const lanes = [];
		const dataMap = {
			[BOARD_TYPES.ISSUES]: issues,
			[BOARD_TYPES.RISKS]: risks
		};
		const preparedData = dataMap[boardType].map((item) => {
			const isDefined = Boolean(item[filterProp] && ((typeof item[filterProp] === 'string' && item[filterProp]) ||
				(typeof item[filterProp] !== 'string' && item[filterProp].length)));

			return {
				id: item._id,
				[filterProp]: isDefined ? item[filterProp] : NOT_DEFINED_PROP,
				metadata: { ...item },
				prop: filterProp
			};
		});

		const groups = groupBy(preparedData, filterProp);
		const isPrefixTitle = filterProp === FILTER_PROPS.owner.value || filterProp === FILTER_PROPS.assigned_roles.value;
		const name = FILTER_PROPS[filterProp].name;
		const dataset = filtersMap[filterProp];
		const notDefinedGroup = groups[NOT_DEFINED_PROP];

		if (notDefinedGroup && notDefinedGroup.length) {
			const propertyName = notDefinedGroup[0].prop;
			const notDefinedLane = {
				id: propertyName,
				title: propertyName === FILTER_PROPS.assigned_roles.value ?
					'Unassigned' : `Not defined ${FILTER_PROPS[propertyName].name}`,
				label: `${notDefinedGroup.length} ${boardType}`,
				cards: notDefinedGroup
			};
			lanes.push(notDefinedLane);
		}

		for (let i = 0; i < values(dataset).length; i++) {
			const lane = {} as any;
			const id = values(dataset)[i];
			lane.id = id;
			lane.title = isPrefixTitle ? `${name} ${id}` : `${id} ${name}`;
			lane.label = `${groups[id] ? groups[id].length : 0} ${boardType}`;
			lane.cards = groups[id] ? groups[id] : [];
			lanes.push(lane);
		}

		return lanes;
	}
);
