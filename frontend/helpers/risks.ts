/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { omit, get } from 'lodash';
import { getAPIUrl } from '../services/api';
import {
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_LEVELS_COLOURS,
	RISK_LEVELS_ICONS,
	RISK_LEVELS,
	LEVELS
} from '../constants/risks';
import { isAdmin, hasPermissions, PERMISSIONS } from './permissions';

export const prepareRisk = (risk, jobs = []) => {
	const thumbnail = getAPIUrl(risk.thumbnail);
	const descriptionThumbnail = risk.viewpoint && risk.viewpoint.screenshot
		? getAPIUrl(risk.viewpoint.screenshot)
		: (risk.descriptionThumbnail || '');

	const residualLikelihood = getValidNumber(risk.residual_likelihood, risk.likelihood);
	const residualConsequence = getValidNumber(risk.residual_consequence, risk.consequence);

	const levelOfRisk = getValidNumber(risk.level_of_risk, calculateLevelOfRisk(risk.likelihood, risk.consequence));
	const residualLevelOfRisk = getValidNumber(
		risk.residual_level_of_risk,
		calculateLevelOfRisk(residualLikelihood, residualConsequence)
	);

	const overallLevelOfRisk = getValidNumber(
		risk.overall_level_of_risk,
		getValidNumber(residualLevelOfRisk, levelOfRisk)
	);

	const { Icon, color } = getRiskStatus(overallLevelOfRisk, risk.mitigation_status);
	const roleColor = get(jobs.find((job) => job.name === get(risk.assigned_roles, '[0]')), 'color');

	return {
		...risk,
		defaultHidden: risk.mitigation_status === RISK_LEVELS.AGREED_FULLY,
		description: risk.desc,
		author: risk.owner,
		createdDate: risk.created,
		thumbnail,
		descriptionThumbnail,
		StatusIconComponent: Icon,
		statusColor: color,
		roleColor,
		residual_likelihood: residualLikelihood,
		residual_consequence: residualConsequence,
		level_of_risk: levelOfRisk,
		overall_level_of_risk: overallLevelOfRisk,
		residual_level_of_risk: residualLevelOfRisk
	};
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

export const getRiskStatus = (levelOfRisk: number, mitigationStatus: string) => {
	const statusIcon = {
		Icon: RISK_LEVELS_ICONS[mitigationStatus] || null,
		color: RISK_LEVELS_COLOURS[levelOfRisk].color
	};

	return statusIcon;
};

export const getRiskPinColor = (levelOfRisk: number, selected: boolean = false) => {
	return (selected)
		? RISK_LEVELS_COLOURS[levelOfRisk].selectedColor
		: RISK_LEVELS_COLOURS[levelOfRisk].pinColor;
};

export const mergeRiskData = (source, data = source) => {
	const hasUnassignedRole = !data.assigned_roles;

	return {
		...source,
		...omit(data, ['assigned_roles', 'description', 'descriptionThumbnail']),
		assigned_roles: hasUnassignedRole ? [] : [data.assigned_roles],
		desc: data.description
	};
};

export const getSortedRisks = (data = []) => {
	return [...data].sort((first, second) => {
		return second.created - first.created;
	});
};

const userJobMatchesCreator = (userJob, riskData) => {
	return (userJob._id && riskData.creator_role && userJob._id === riskData.creator_role);
};

const isViewer = (permissions) => {
	return permissions && !hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};

const isAssignedJob = (riskData, userJob, permissions) => {
	return riskData && userJob &&
		(userJob._id &&
			riskData.assigned_roles[0] &&
			userJob._id === riskData.assigned_roles[0]) &&
			!isViewer(permissions);
};

const isJobOwner = (riskData, userJob, permissions, currentUser) => {
	return riskData && userJob &&
		(riskData.owner === currentUser ||
		userJobMatchesCreator(userJob, riskData)) &&
		!isViewer(permissions);
};

const getValidNumber = (value, defaultValue?) => {
	if (!isNaN(value)) {
		return value;
	}

	return defaultValue;
};

const canChangeStatusToClosed = (riskData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(riskData, userJob, permissions, currentUser);
};

export const canUpdateRisk = (riskData, userJob, permissions, currentUser) => {
	return canChangeStatusToClosed(riskData, userJob, permissions, currentUser) ||
		isAssignedJob(riskData, userJob, permissions);
};
