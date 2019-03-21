import { omit, pick } from 'lodash';
import { GROUPS_TYPES, GROUP_TYPES_ICONS } from '../constants/groups';
import { COLOR } from '../styles';
import { getGroupHexColor, hexToArray } from './colors';
import { prepareCriterion } from './criteria';
import { calculateTotalMeshes } from './tree';

export const prepareGroup = (group) => {
	const isSmartGroup = group.rules && group.rules.length;
	const type = isSmartGroup ? GROUPS_TYPES.SMART : GROUPS_TYPES.NORMAL;

	return {
		...group,
		type,
		createdDate: group.createdAt,
		updateDate: group.updateAt,
		StatusIconComponent: GROUP_TYPES_ICONS[type],
		statusColor: COLOR.BLACK_54,
		color: getGroupHexColor(group.color),
		rules: (group.rules || []).map(prepareCriterion),
		objects: group.objects || [],
		totalSavedMeshes: calculateTotalMeshes(group.objects) || 0
	};
};

export const normalizeGroup = (group) => {
	const normalizedGroup = {
		color: hexToArray(group.color),
		createdAt: group.createdDate,
		updatedAt: group.updateDate,
		...pick(group, ['name', 'author', '_id', 'description'])
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
