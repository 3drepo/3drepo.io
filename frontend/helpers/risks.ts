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

import { get } from 'lodash';
import {
	LEVELS,
	RISK_CONSEQUENCES,
	RISK_LEVELS,
	RISK_LEVELS_COLOURS,
	RISK_LEVELS_ICONS,
	RISK_LIKELIHOODS
} from '../constants/risks';
import { getAPIUrl } from '../services/api';
import { hasPermissions, isAdmin, PERMISSIONS } from './permissions';

export const prepareRisk = (risk, jobs = []) => {
	const preparedRisk = {...risk};

	if (preparedRisk.thumbnail) {
		preparedRisk.thumbnail = getAPIUrl(preparedRisk.thumbnail);
	}

	const descriptionThumbnail = preparedRisk.viewpoint && preparedRisk.viewpoint.screenshot
		? getAPIUrl(preparedRisk.viewpoint.screenshot)
		: (preparedRisk.descriptionThumbnail || '');

	if (descriptionThumbnail) {
		preparedRisk.descriptionThumbnail = descriptionThumbnail;
	}

	if (preparedRisk.residual_likelihood || preparedRisk.likelihood) {
		preparedRisk.residual_likelihood  = getValidNumber(preparedRisk.residual_likelihood, preparedRisk.likelihood);
	}

	if (preparedRisk.residual_consequence ||  preparedRisk.consequence) {
		preparedRisk.residual_consequence = getValidNumber(preparedRisk.residual_consequence, preparedRisk.consequence);
	}

	if (preparedRisk.residual_likelihood || preparedRisk.residual_consequence ) {
		preparedRisk.residual_level_of_risk  = getValidNumber(
			preparedRisk.residual_level_of_risk,
			calculateLevelOfRisk(preparedRisk.residual_likelihood , preparedRisk.residual_consequence )
		);
	}

	if (preparedRisk.level_of_risk || preparedRisk.likelihood || preparedRisk.consequence) {
		preparedRisk.level_of_risk = getValidNumber(preparedRisk.level_of_risk,
			calculateLevelOfRisk(preparedRisk.likelihood, preparedRisk.consequence));
	}

	if (preparedRisk.overall_level_of_risk || preparedRisk.residual_level_of_risk  || preparedRisk.level_of_risk) {
		preparedRisk.overall_level_of_risk = getValidNumber(
			preparedRisk.overall_level_of_risk,
			getValidNumber(preparedRisk.residual_level_of_risk , preparedRisk.level_of_risk)
		);
	}

	if (preparedRisk.overall_level_of_risk && preparedRisk.mitigation_status) {
		const { Icon, color } = getRiskStatus(preparedRisk.overall_level_of_risk, preparedRisk.mitigation_status);
		preparedRisk.StatusIconComponent = Icon;
		preparedRisk.statusColor = color;
	}

	if (preparedRisk.assigned_roles) {
		preparedRisk.roleColor = get(jobs.find((job) => job.name === get(preparedRisk.assigned_roles, '[0]')), 'color');
	}

	if (preparedRisk.mitigation_status) {
		preparedRisk.defaultHidden = preparedRisk.mitigation_status === RISK_LEVELS.AGREED_FULLY;
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

export const getRiskStatus = (levelOfRisk: number, mitigationStatus: string) => {
	const statusIcon = {
		Icon: RISK_LEVELS_ICONS[mitigationStatus] || null,
		color: RISK_LEVELS_COLOURS[levelOfRisk].color
	};

	return statusIcon;
};

export const getRiskPinColor = (risk) => {
	const levelOfRisk = (risk.overall_level_of_risk !== undefined) ? risk.overall_level_of_risk : 4;
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

const canChangeStatusToClosed = (riskData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(riskData, userJob, permissions, currentUser);
};

export const canChangeStatus = (riskData, userJob, permissions, currentUser) => {
	return canChangeStatusToClosed(riskData, userJob, permissions, currentUser) ||
		isAssignedJob(riskData, userJob, permissions);
};

export const canChangeBasicProperty = (riskData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(riskData, userJob, permissions, currentUser) &&
		canComment(riskData, userJob, permissions, currentUser);
};

export const canChangeAssigned = (riskData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || canChangeBasicProperty(riskData, userJob, permissions, currentUser);
};

export const canComment = (riskData, userJob, permissions, currentUser) => {
	const ableToComment =
		isAdmin(permissions) ||
		isJobOwner(riskData, userJob, permissions, currentUser) ||
		canCommentRisk(permissions);

	return ableToComment;
};
