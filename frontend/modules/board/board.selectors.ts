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

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { get, groupBy, memoize, sortBy, startCase, uniqBy, values } from 'lodash';
import { createSelector } from 'reselect';
import { PRIORITIES, STATUSES } from '../../constants/issues';
import { LEVELS_LIST, RISK_CATEGORIES, RISK_MITIGATION_STATUSES } from '../../constants/risks';
import { sortByDate } from '../../helpers/sorting';
import { selectAllFilteredIssues, selectSortOrder as selectIssuesSortOrder } from '../issues';
import { selectJobs } from '../jobs';
import { selectTopicTypes } from '../model';
import { selectAllFilteredRisks, selectSortOrder as selectRisksSortOrder } from '../risks';
import { BOARD_TYPES, ISSUE_FILTER_PROPS, NOT_DEFINED_PROP, RISK_FILTER_PROPS } from './board.constants';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

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

export const selectShowClosedIssues = createSelector(
	selectBoardDomain, (state) => state.showClosedIssues
);

const getNextWeekTimestamp = memoize((nextWeekNumber = 1) => {
	return dayjs().startOf('day').add(7 * nextWeekNumber, 'day').valueOf();
});

const getProp = (item, prop) => {
	if (prop === ISSUE_FILTER_PROPS.due_date.value) {
		const dueDate = dayjs(item[prop]);
		if (Number(!!(new Date().valueOf() >= dueDate.valueOf()))) {
			return 'overdue';
		}
		const secondWeekDate = getNextWeekTimestamp(2);
		const firstWeekDate = getNextWeekTimestamp();
		if (dueDate.isSameOrBefore(firstWeekDate, 'day')) {
			return firstWeekDate;
		}
		if (dueDate.isBetween(firstWeekDate, secondWeekDate, 'day', '[)')) {
			return secondWeekDate;
		}
		return getNextWeekTimestamp(3);
	}
	return item[prop];
};

const selectJobsValues = createSelector(
	selectJobs, (jobs) => {
	return jobs.map(({ _id }) => ({ name: _id, value: _id }));
});

const selectRawCardData = createSelector(
	selectBoardDomain,
	selectAllFilteredIssues,
	selectAllFilteredRisks,
	selectShowClosedIssues,
	selectIssuesSortOrder,
	selectRisksSortOrder,
	({ filterProp }, issues, risks, showClosedIssues, issuesSortOrder, risksSortOrder) => {
		const activeIssues = issues.filter(({ status }) => {
			const activeGroupingByStatus = filterProp === ISSUE_FILTER_PROPS.status.value;
			return showClosedIssues || activeGroupingByStatus || status !== STATUSES.CLOSED;
		});

		return {
			[BOARD_TYPES.ISSUES]: sortByDate(activeIssues, { order: issuesSortOrder }),
			[BOARD_TYPES.RISKS]: sortByDate(risks, { order: risksSortOrder })
		};
});

export const selectLanes = createSelector(
	selectBoardDomain,
	selectRawCardData,
	selectTopicTypes,
	selectJobsValues,
	({ filterProp, boardType }, rawCardData, topicTypes, jobsValues) => {
		const isIssueBoardType = boardType === 'issues';

		const FILTER_PROPS = isIssueBoardType ? ISSUE_FILTER_PROPS : RISK_FILTER_PROPS;

		const datesValues = [{
			name: ISSUE_FILTER_PROPS.due_date.notDefinedLabel,
			value: ISSUE_FILTER_PROPS.due_date.notDefinedLabel
		}, {
			name: 'Overdue',
			value: 'overdue'
		}, {
			name: 'in 1 week',
			value: getNextWeekTimestamp()
		}, {
			name: 'in 2 weeks',
			value: getNextWeekTimestamp(2)
		}, {
			name: 'in 3 weeks+',
			value: getNextWeekTimestamp(3)
		}];

		const issueFiltersMap = {
			[ISSUE_FILTER_PROPS.status.value]: values(STATUSES).map((s) => ({
				name: startCase(s),
				value: s
			})),
			[ISSUE_FILTER_PROPS.priority.value]: values(PRIORITIES).map((p) => ({
				name: startCase(p),
				value: p
			})),
			[ISSUE_FILTER_PROPS.topic_type.value]: topicTypes.map((t) => ({
				name: t.label,
				value: t.value
			})),
			[ISSUE_FILTER_PROPS.creator_role.value]: jobsValues,
			[ISSUE_FILTER_PROPS.assigned_roles.value]: jobsValues,
			[ISSUE_FILTER_PROPS.due_date.value]: datesValues,
		};

		const riskFiltersMap = {
			[RISK_FILTER_PROPS.level_of_risk.value]: LEVELS_LIST,
			[RISK_FILTER_PROPS.residual_level_of_risk.value]: LEVELS_LIST,
			[RISK_FILTER_PROPS.category.value]: RISK_CATEGORIES,
			[RISK_FILTER_PROPS.mitigation_status.value]: RISK_MITIGATION_STATUSES,
			[RISK_FILTER_PROPS.creator_role.value]: jobsValues,
			[RISK_FILTER_PROPS.assigned_roles.value]: jobsValues,
		};

		const filtersMap = isIssueBoardType ? issueFiltersMap : riskFiltersMap;

		const lanes = [];

		const preparedData = rawCardData[boardType].map((item) => {
			const isDefined = Boolean(item[filterProp] && ((typeof item[filterProp] === 'string' && item[filterProp]) ||
				(typeof item[filterProp] !== 'string' && item[filterProp].length))) || typeof item[filterProp] === 'number';

			const defaultValue = get(FILTER_PROPS[filterProp], 'notDefinedLabel', NOT_DEFINED_PROP);

			return {
				id: item._id,
				[filterProp]: isDefined ? getProp(item, filterProp) : defaultValue,
				metadata: {
					...item,
					id: item._id,
					teamspace: item.account,
					model: item.model,
					type: boardType,
					showModelButton: true
				},
				prop: filterProp
			};
		});

		const groups = groupBy(preparedData, filterProp);
		const dataset = filtersMap[filterProp];
		const notDefinedGroup = groups[NOT_DEFINED_PROP];

		if (notDefinedGroup && notDefinedGroup.length) {
			const propertyName = notDefinedGroup[0].prop;
			const notDefinedLane = {
				id: propertyName,
				title: propertyName === FILTER_PROPS.assigned_roles.value ?
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
					lane.title = dataset[i].name;
					lane.label = `${groups[id] ? groups[id].length : 0} ${boardType}`;
					lane.cards = groups[id] ? groups[id] : [];

					lanes.push(lane);
				}
			}
		}

		return lanes;
	}
);

export const selectCards = createSelector(
	selectLanes,
	(lanes) => {
		const cards = [];
		lanes.forEach((lane) => cards.push(...lane.cards));
		return cards;
	}
);
