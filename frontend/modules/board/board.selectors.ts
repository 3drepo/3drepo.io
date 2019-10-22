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

import { groupBy, startCase, values } from 'lodash';
import { createSelector } from 'reselect';
import { PRIORITIES, STATUSES } from '../../constants/issues';
import { LEVELS_LIST, RISK_CATEGORIES, RISK_MITIGATION_STATUSES } from '../../constants/risks';
import { sortByDate } from '../../helpers/sorting';
import { selectFilteredIssues, selectSortOrder as selectIssuesSortOrder } from '../issues';
import { selectJobs } from '../jobs';
import { selectTopicTypes } from '../model';
import { selectFilteredRisks,  selectSortOrder as selectRisksSortOrder } from '../risks';
import { selectUsers } from '../userManagement';
import { BOARD_TYPES, ISSUE_FILTER_PROPS, NOT_DEFINED_PROP, RISK_FILTER_PROPS } from './board.constants';

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

export const selectLanes = createSelector(
	selectBoardDomain,
	selectFilteredIssues,
	selectFilteredRisks,
	selectTopicTypes,
	selectJobs,
	selectUsers,
	selectIssuesSortOrder,
	selectRisksSortOrder,
	({ filterProp, boardType }, issues, risks, topicTypes, jobs, users, issuesSortOrder, risksSortOrder) => {
		const isIssueBoardType = boardType === 'issues';

		const usersValues = users.map((u) => {
			return {
				value: u.user,
				name: `${u.firstName} ${u.lastName}`
			};
		});

		const issueFiltersMap = {
			[ISSUE_FILTER_PROPS.status.value]: values(STATUSES).map((s) => {
				return {
					name: startCase(s),
					value: s
				};
			}),
			[ISSUE_FILTER_PROPS.priority.value]: values(PRIORITIES).map((p) => {
				return {
					name: startCase(p),
					value: p
				};
			}),
			[ISSUE_FILTER_PROPS.topic_type.value]: topicTypes.map((t) => {
				return {
					name: t.label,
					value: t.value
				};
			}),
			[ISSUE_FILTER_PROPS.owner.value]: usersValues,
			[ISSUE_FILTER_PROPS.assigned_roles.value]: jobs.map((j) => {
				return {
					name: j._id,
					value: j._id,
				};
			})
		};

		const riskFiltersMap = {
			[RISK_FILTER_PROPS.level_of_risk.value]: LEVELS_LIST,
			[RISK_FILTER_PROPS.residual_level_of_risk.value]: LEVELS_LIST,
			[RISK_FILTER_PROPS.category.value]: RISK_CATEGORIES,
			[RISK_FILTER_PROPS.mitigation_status.value]: RISK_MITIGATION_STATUSES,
			[ISSUE_FILTER_PROPS.owner.value]: usersValues,
		};

		const FILTER_PROPS = isIssueBoardType ? ISSUE_FILTER_PROPS : RISK_FILTER_PROPS;

		const filtersMap = isIssueBoardType ? issueFiltersMap : riskFiltersMap;

		const lanes = [];
		const dataMap = {
			[BOARD_TYPES.ISSUES]: sortByDate(issues, { order: issuesSortOrder }),
			[BOARD_TYPES.RISKS]: sortByDate(risks, { order: risksSortOrder })
		};

		const preparedData = dataMap[boardType].map((item) => {
			const isDefined = Boolean(item[filterProp] && ((typeof item[filterProp] === 'string' && item[filterProp]) ||
				(typeof item[filterProp] !== 'string' && item[filterProp].length))) || typeof item[filterProp] === 'number';

			return {
				id: item._id,
				[filterProp]: isDefined ? item[filterProp] : NOT_DEFINED_PROP,
				metadata: { ...item },
				prop: filterProp
			};
		});

		const groups = groupBy(preparedData, filterProp);
		const isPrefixTitle =
			filterProp === ISSUE_FILTER_PROPS.owner.value || filterProp === ISSUE_FILTER_PROPS.assigned_roles.value;

		const name = FILTER_PROPS[filterProp] ? FILTER_PROPS[filterProp].name : '';
		const dataset = filtersMap[filterProp];
		const notDefinedGroup = groups[NOT_DEFINED_PROP];

		if (notDefinedGroup && notDefinedGroup.length) {
			const propertyName = notDefinedGroup[0].prop;
			const notDefinedLane = {
				id: propertyName,
				title: propertyName === ISSUE_FILTER_PROPS.assigned_roles.value ?
					'Unassigned' : `Not defined ${FILTER_PROPS[propertyName] ? FILTER_PROPS[propertyName].name : ''}`,
				label: `${notDefinedGroup.length} ${boardType}`,
				cards: notDefinedGroup
			};
			lanes.push(notDefinedLane);
		}

		if (dataset) {
			for (let i = 0; i < dataset.length; i++) {
				const lane = {} as any;
				const id = dataset[i].value;

				if (id !== null && id !== '') {
					lane.id = `${id}`;
					lane.title = isPrefixTitle ? `${name} ${dataset[i].name}` : `${name} ${dataset[i].name}`;
					lane.label = `${groups[id] ? groups[id].length : 0} ${boardType}`;
					lane.cards = groups[id] ? groups[id] : [];

					lanes.push(lane);
				}
			}
		}

		return lanes;
	}
);
