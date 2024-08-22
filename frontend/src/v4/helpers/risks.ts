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

import { get } from 'lodash';

import { getFilterValues, UNASSIGNED_JOB } from '../constants/reportedItems';
import {
	LEVELS,
	LEVELS_OF_RISK,
	RISK_CONSEQUENCES,
	RISK_DEFAULT_HIDDEN_LEVELS,
	RISK_FILTER_RELATED_FIELDS,
	RISK_LEVELS_COLOURS,
	RISK_LEVELS,
	RISK_LEVELS_ICONS,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES,
	RISKS_ACTIONS_MENU
} from '../constants/risks';
import { getAPIUrl } from '../services/api/default';
import { hasPermissions, isAdmin, PERMISSIONS } from './permissions';
import { IHeaderMenuItem } from './reportedItems';
import { setShapesUuids } from './shapes';

export const prepareRisk = (risk, jobs = []) => {
	const preparedRisk = {...risk};

	if (risk.thumbnail) {
		preparedRisk.thumbnail = `${getAPIUrl(risk.thumbnail)}?${new Date().getTime()}`;
	}

	const descriptionThumbnail = risk.viewpoint && risk.viewpoint.screenshot
		? getAPIUrl(risk.viewpoint.screenshot)
		: (risk.descriptionThumbnail || '');

	if (descriptionThumbnail) {
		preparedRisk.descriptionThumbnail = descriptionThumbnail;
	}

	if (!(isNaN(preparedRisk.residual_likelihood) && isNaN(preparedRisk.likelihood))) {
		preparedRisk.residual_likelihood  = getValidNumber(preparedRisk.residual_likelihood, preparedRisk.likelihood);
	}

	if (!(isNaN(preparedRisk.residual_consequence) && isNaN(preparedRisk.consequence))) {
		preparedRisk.residual_consequence = getValidNumber(preparedRisk.residual_consequence, preparedRisk.consequence);
	}

	if (!(isNaN(preparedRisk.residual_likelihood) && isNaN(preparedRisk.residual_consequence))) {
		preparedRisk.residual_level_of_risk  = getValidPositiveNumber(
			preparedRisk.residual_level_of_risk,
			calculateLevelOfRisk(preparedRisk.residual_likelihood, preparedRisk.residual_consequence )
		);
	}

	if (!(isNaN(preparedRisk.level_of_risk) && isNaN(preparedRisk.likelihood) && isNaN(preparedRisk.consequence))) {
		preparedRisk.level_of_risk = getValidPositiveNumber(preparedRisk.level_of_risk,
			calculateLevelOfRisk(preparedRisk.likelihood, preparedRisk.consequence));
	}

	if (!(isNaN(preparedRisk.overall_level_of_risk) &&
		isNaN(preparedRisk.residual_level_of_risk) &&
		isNaN(preparedRisk.level_of_risk))) {
		preparedRisk.overall_level_of_risk = getValidPositiveNumber(
			preparedRisk.overall_level_of_risk,
			getValidPositiveNumber(preparedRisk.residual_level_of_risk , preparedRisk.level_of_risk)
		);
	}

	preparedRisk.statusColor = getRiskColor(preparedRisk.overall_level_of_risk);
	preparedRisk.StatusIconComponent = getRiskIcon(preparedRisk.mitigation_status);

	if (preparedRisk.assigned_roles) {
		preparedRisk.roleColor = get(jobs.find((job) => job.name === get(preparedRisk.assigned_roles, '[0]')), 'color');
	}

	preparedRisk.defaultHidden = RISK_DEFAULT_HIDDEN_LEVELS.includes(preparedRisk.mitigation_status);
	preparedRisk.color = getRiskColor(risk.residual_level_of_risk);

	if (preparedRisk.shapes) {
		preparedRisk.shapes = setShapesUuids(preparedRisk.shapes);
	}

	return preparedRisk;
};

export const calculateLevelOfRisk = (likelihood: any, consequence: any): number => {
	let levelOfRisk = -1;

	likelihood = parseInt(likelihood, 10);
	consequence = parseInt(consequence, 10);

	if (0 <= likelihood && 0 <= consequence) {
		const score: number = likelihood + consequence;

		if (6 < score) {
			levelOfRisk = LEVELS.VERY_HIGH;
		} else if (5 < score) {
			levelOfRisk = LEVELS.HIGH;
		} else if (2 < score) {
			levelOfRisk = LEVELS.MODERATE;
		} else if (1 < score) {
			levelOfRisk = LEVELS.LOW;
		} else {
			levelOfRisk = LEVELS.VERY_LOW;
		}
	}

	return levelOfRisk;
};

export const getRiskConsequenceName = (consequence: number) => {
	const filteredDefinitions = RISK_CONSEQUENCES.filter((def) => def.value === consequence);
	return (filteredDefinitions.length > 0) ? filteredDefinitions[0].name : '(invalid)';
};

export const getRiskLikelihoodName = (likelihood: number) => {
	const filteredDefinitions = RISK_LIKELIHOODS.filter((def) => def.value === likelihood);
	return (filteredDefinitions.length > 0) ? filteredDefinitions[0].name : '(invalid)';
};

const getRiskIcon = (mitigationStatus) =>  RISK_LEVELS_ICONS[mitigationStatus] || RISK_LEVELS_ICONS[RISK_LEVELS.UNMITIGATED];
export const getRiskColor = (levelOfRisk) => RISK_LEVELS_COLOURS[getValidPositiveNumber(levelOfRisk, -1)].color;

export const getRiskStatus = (levelOfRisk: number, mitigationStatus: string) => {
	return ({
		Icon: getRiskIcon(mitigationStatus),
		color: getRiskColor(levelOfRisk),
	});
};

export const getRiskPinColor = (risk) => {
	const levelOfRisk = getValidPositiveNumber(risk.overall_level_of_risk, 4);
	return RISK_LEVELS_COLOURS[levelOfRisk].pinColor;
};

const userJobMatchesCreator = (userJob, riskData) => {
	return (userJob._id && riskData.creator_role && userJob._id === riskData.creator_role);
};

const isViewer = (permissions) => {
	return permissions && !hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};

const canCommentRisk = (permissions) => {
	return permissions && hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};

const isJobOwner = (riskData, userJob, permissions, currentUser) => {
	return riskData && userJob &&
		(riskData.owner === currentUser ||
		userJobMatchesCreator(userJob, riskData)) &&
		!isViewer(permissions);
};

const isAssignedJob = (riskData, userJob, permissions) => {
	return riskData && userJob &&
		(userJob._id &&
			riskData.assigned_roles && riskData.assigned_roles.length &&
			userJob._id === riskData.assigned_roles[0]) &&
			!isViewer(permissions);
};

const getValidNumber = (value, defaultValue?) => {
	if (!isNaN(value)) {
		return value;
	}

	return defaultValue;
};

const getValidPositiveNumber = (value, defaultValue?) => {
	const validNumber = getValidNumber(value, defaultValue);

	return validNumber >= 0 ? validNumber : defaultValue;
};

export const canChangeBasicProperty = (riskData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(riskData, userJob, permissions, currentUser) &&
		canComment(riskData, userJob, permissions, currentUser);
};

export const canComment = (riskData, userJob, permissions, currentUser) => {
	const ableToComment =
		isAdmin(permissions) ||
		isJobOwner(riskData, userJob, permissions, currentUser) ||
		canCommentRisk(permissions);

	return ableToComment;
};

export const getRiskFilterValues = (property) =>
	property.map((value) => ({
		label: value,
		value
	}));

const getFromToFilter = (label) =>  [{
		label: 'From',
		value: {
			label: label + ' from',
			value: label + 'from',
			date: null
		}
	}, {
		label: 'To',
		value: {
			label: label + ' to',
			value: label + 'to',
			date: null
		}
	}];

export const filtersValuesMap = (jobs, settings) => {
	const jobsList = [...jobs, UNASSIGNED_JOB];

	return {
		[RISK_FILTER_RELATED_FIELDS.CATEGORY]: getRiskFilterValues(settings.category),
		[RISK_FILTER_RELATED_FIELDS.MITIGATION_STATUS]: getFilterValues(RISK_MITIGATION_STATUSES),
		[RISK_FILTER_RELATED_FIELDS.CREATED_BY]: getFilterValues(jobs),
		[RISK_FILTER_RELATED_FIELDS.RISK_OWNER]: getFilterValues(jobsList),
		[RISK_FILTER_RELATED_FIELDS.ELEMENT]: getRiskFilterValues(settings.element),
		[RISK_FILTER_RELATED_FIELDS.LOCATION]: getRiskFilterValues(settings.location_desc),
		[RISK_FILTER_RELATED_FIELDS.RISK_FACTOR]: getRiskFilterValues(settings.risk_factor),
		[RISK_FILTER_RELATED_FIELDS.ASSOCIATED_ACTIVITY]: getRiskFilterValues(settings.associated_activity),
		[RISK_FILTER_RELATED_FIELDS.SCOPE]: getRiskFilterValues(settings.scope),
		[RISK_FILTER_RELATED_FIELDS.MITIGATION_STAGE]: getRiskFilterValues(settings.mitigation_stage),
		[RISK_FILTER_RELATED_FIELDS.MITIGATION_TYPE]: getRiskFilterValues(settings.mitigation_type),
		[RISK_FILTER_RELATED_FIELDS.RISK_CONSEQUENCE]: getFilterValues(RISK_CONSEQUENCES),
		[RISK_FILTER_RELATED_FIELDS.RISK_LIKELIHOOD]: getFilterValues(RISK_LIKELIHOODS),
		[RISK_FILTER_RELATED_FIELDS.RESIDUAL_CONSEQUENCE]: getFilterValues(RISK_CONSEQUENCES),
		[RISK_FILTER_RELATED_FIELDS.RESIDUAL_LIKELIHOOD]: getFilterValues(RISK_LIKELIHOODS),
		[RISK_FILTER_RELATED_FIELDS.LEVEL_OF_RISK]: getFilterValues(LEVELS_OF_RISK),
		[RISK_FILTER_RELATED_FIELDS.RESIDUAL_LEVEL_OF_RISK]: getFilterValues(LEVELS_OF_RISK),
		[RISK_FILTER_RELATED_FIELDS.OVERALL_LEVEL_OF_RISK]: getFilterValues(LEVELS_OF_RISK),
		[RISK_FILTER_RELATED_FIELDS.START_DATETIME]: getFromToFilter('Start'),
		[RISK_FILTER_RELATED_FIELDS.DUE_DATE]: getFromToFilter('Start')
	};
};

export const getHeaderMenuItems = (props) => {
	const {teamspace, model, printItems, downloadItems, toggleSortOrder,
		toggleShowPins ,  showPins, sortOrder, setSortBy, sortByField} = props;

	const items = [{
		...RISKS_ACTIONS_MENU.DOWNLOAD,
		onClick: () => downloadItems(teamspace, model)
	}, {
		...RISKS_ACTIONS_MENU.SORT_ORDER,
		onClick: () => {
			toggleSortOrder();
		},
		Icon: sortOrder === 'asc' ? RISKS_ACTIONS_MENU.SORT_ORDER.ASC : RISKS_ACTIONS_MENU.SORT_ORDER.DESC
	}];

	const togglePinItem = {
		...RISKS_ACTIONS_MENU.SHOW_PINS,
		enabled: showPins,
		onClick: () => toggleShowPins(!showPins)
	};

	const menuItems: IHeaderMenuItem[] = !!toggleShowPins ? [...items, {...togglePinItem}] : [...items];

	menuItems.push({
		label: 'Sort by',
		subItems: [
			{
				label: 'Created at',
				onClick: () => setSortBy('created'),
				enabled: sortByField === 'created'
			},
			{
				label: 'Start date',
				onClick: () => setSortBy('sequence_start'),
				enabled: sortByField === 'sequence_start'
			},
			]
	});

	return menuItems;
};
