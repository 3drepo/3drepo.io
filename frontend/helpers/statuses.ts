import { ISSUE_STATUS_COLORS, ISSUE_STATUS_ICONS } from '../constants/issues';
import { theme } from '../styles';

export const getIssueStatus = (priority, status) => {
	const statusIcon = {
		Icon: null,
		color: theme.colors.WHITE
	};

	if (ISSUE_STATUS_ICONS[status]) {
		statusIcon.Icon = ISSUE_STATUS_ICONS[status];
	}

	if (ISSUE_STATUS_COLORS[priority]) {
		statusIcon.color = ISSUE_STATUS_COLORS[priority];
	}

	return statusIcon;
};
