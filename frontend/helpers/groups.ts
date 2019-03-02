import { omit } from 'lodash';
import { GROUPS_TYPES, GROUP_TYPES_ICONS } from '../constants/groups';
import { COLOR } from '../styles';
import { getGroupHexColor } from './colors';

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
		color: getGroupHexColor(group.color)
	};
};

export const mergeGroupData = (source, data = source) => {
	return {
		...source,
		...omit(data, ['description']),
		desc: data.description
	};
};
