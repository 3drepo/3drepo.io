import { pick, get } from 'lodash';
import { getAPIUrl } from '../services/api';
import { RISK_LEVELS_COLORS, RISK_LEVELS_ICONS } from '../constants/risks';

export const prepareRisk = (risk, jobs = []) => {
	const thumbnail = getAPIUrl(risk.thumbnail);
	const { Icon, color } = getRiskStatus(risk.level_of_risk, risk.mitigation_status);
	const roleColor = get(jobs.find((job) => job._id === get(risk.assigned_roles, '[0]')), 'color');

	return {
		...risk,
		description: risk.desc,
		author: risk.owner,
		createdDate: risk.created,
		thumbnail,
		StatusIconComponent: Icon,
		statusColor: color,
		roleColor
	};
};

export const calculateLevelOfRisk = (likelihood: string, consequence: string): number => {
	let levelOfRisk = 0;

	if (likelihood && consequence) {
		const likelihoodConsequenceScore: number = parseInt(likelihood, 10) + parseInt(consequence, 10);

		if (6 < likelihoodConsequenceScore) {
			levelOfRisk = 4;
		} else if (5 < likelihoodConsequenceScore) {
			levelOfRisk = 3;
		} else if (2 < likelihoodConsequenceScore) {
			levelOfRisk = 2;
		} else if (1 < likelihoodConsequenceScore) {
			levelOfRisk = 1;
		} else {
			levelOfRisk = 0;
		}
	}

	return levelOfRisk;
};

export const getRiskStatus = (levelOfRisk: number, mitigationStatus: string) => {
	const statusIcon = {
		Icon: RISK_LEVELS_ICONS[mitigationStatus] || null,
		color: RISK_LEVELS_COLORS[levelOfRisk]
	};

	return statusIcon;
};
