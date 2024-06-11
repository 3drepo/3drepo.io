/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import {  isEqual, omit, pick } from 'lodash';
import { select } from 'redux-saga/effects';
import { GROUP_TYPES_ICONS, GROUPS_TYPES } from '../constants/groups';
import { selectNumNodesByMeshSharedIdsArray } from '../modules/tree';
import { COLOR } from '../styles';
import { getGroupHexColor, hexToArray } from './colors';
import { prepareCriterion } from './criteria';
import { calculateTotalMeshes } from './tree';

export const prepareGroup = (group) => {
	const isSmartGroup = group.rules && group.rules.length;
	const type = isSmartGroup ? GROUPS_TYPES.SMART : GROUPS_TYPES.NORMAL;

	return {
		...omit(group, 'author', 'createdDate', 'description'),
		_id: group._id,
		owner: group.author,
		created: group.createdAt,
		desc: group.description,
		type,
		StatusIconComponent: GROUP_TYPES_ICONS[type],
		statusColor: COLOR.BLACK_54,
		color: getGroupHexColor(group.color),
		rules: (group.rules || []).map(prepareCriterion),
		objects: group.objects || [],
		totalSavedMeshes: calculateTotalMeshes(group.objects) || 0
	};
};

export function* prepareGroupWithCount(group) {

	let nodeCount = 0;
	for (let i = 0; i < (group.objects || []).length; ++i) {
		const entry = group.objects[i];

		const nNodes = yield select(selectNumNodesByMeshSharedIdsArray, entry.shared_ids);
		nodeCount += nNodes;
	}

	const isSmartGroup = group.rules && group.rules.length;
	const type = isSmartGroup ? GROUPS_TYPES.SMART : GROUPS_TYPES.NORMAL;

	return {
		...omit(group, 'author', 'createdDate', 'description'),
		_id: group._id,
		owner: group.author,
		created: group.createdAt,
		desc: group.description,
		type,
		StatusIconComponent: GROUP_TYPES_ICONS[type],
		statusColor: COLOR.BLACK_54,
		color: getGroupHexColor(group.color),
		rules: (group.rules || []).map(prepareCriterion),
		objects: group.objects || [],
		totalSavedMeshes: nodeCount
	};

}

export const normalizeGroup = (group) => {
	const normalizedGroup = {
		color: hexToArray(group.color),
		...pick(group, ['name', 'author']),
		description: group.desc || group.description
	} as any;

	if (group.type === GROUPS_TYPES.SMART) {
		normalizedGroup.rules = group.rules;
	}

	if (group.type === GROUPS_TYPES.NORMAL) {
		normalizedGroup.objects = group.objects;
	}

	return normalizedGroup;
};

export const mergeGroupData = (source, data = source) => {
	return {
		...source,
		...omit(data, ['description']),
		desc: data.description
	};
};

export const stripGroupRules = ({rules, ...restGroupFields}) => restGroupFields;

export const rulesAreEqual = (groupA, groupB) => {
	const rulesA: any[] = groupA.rules || [];
	const rulesB: any[] = groupB.rules || [];

	if (rulesA.length !== rulesB.length) {
		return false;
	}

	const rulesADict = rulesA.reduce((dict, rule) => {
		dict[rule.name] = rule;
		return dict;
	}, {});

	return rulesB.every((ruleB) => {
		const ruleA = rulesADict[ruleB.name];
		if (!ruleA) {
			return false;
		}
		return isEqual(ruleA, ruleB);
	});
};