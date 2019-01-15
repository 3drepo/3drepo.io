import { pick, get } from 'lodash';
import { getAPIUrl } from '../services/api';
import More from '@material-ui/icons/MoreVert';
import AdjustIcon from '@material-ui/icons/Adjust';
import LensIcon from '@material-ui/icons/Lens';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';

export const prepareIssue = (issue, jobs = []) => {
	const thumbnail = getAPIUrl(issue.thumbnail);
	const { Icon, color } = this.getStatusIcon(issue.priority, issue.status);
	const roleColor = get(jobs.find((job) => job._id === get(issue.assigned_roles, '[0]')), 'color');

	return {
		name: issue.name,
		description: issue.description,
		author: issue.owner,
		createdDate: issue.created,
		thumbnail,
		StatusIconComponent: Icon,
		statusColor: color,
		roleColor
	};
};

const ISSUE_STATUSES = {
	OPEN: 'open',
	IN_PROGRESS: 'in progress',
	FOR_APPROVAL: 'for approval',
  CLOSED: 'closed'
};

const ISSUE_PRIORITIES = {
	NONE: 'none',
	LOW: 'low',
	MEDIUM: 'medium',
	HIGH: 'high'
};

const ISSUE_STATUSES_COLORS = {
	[ISSUE_PRIORITIES.NONE]: '#777777',
	[ISSUE_PRIORITIES.LOW]: '#4CAF50',
	[ISSUE_PRIORITIES.MEDIUM]: '#FF9800',
	[ISSUE_PRIORITIES.HIGH]: '#F44336'
};

const ISSUE_STATUSES_ICONS = {
  [ISSUE_STATUSES.OPEN]: PanoramaFishEyeIcon,
  [ISSUE_STATUSES.IN_PROGRESS]: LensIcon,
  [ISSUE_STATUSES.FOR_APPROVAL]: AdjustIcon,
  [ISSUE_STATUSES.CLOSED]: CheckCircleIcon
};

export const getStatusIcon = (priority, status) => {
  const statusIcon = {
    Icon: ISSUE_STATUSES_ICONS[status] || null,
    color: ISSUE_STATUSES_COLORS[priority] || null
  };

  return {...statusIcon};
};
