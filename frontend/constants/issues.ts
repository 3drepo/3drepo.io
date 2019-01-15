import LensIcon from '@material-ui/icons/Lens';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import AdjustIcon from '@material-ui/icons/Adjust';

export const ISSUE_PANEL_NAME = 'issue';

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

export const ISSUE_STATUSES_COLORS = {
	[ISSUE_PRIORITIES.NONE]: '#777777',
	[ISSUE_PRIORITIES.LOW]: '#4CAF50',
	[ISSUE_PRIORITIES.MEDIUM]: '#FF9800',
	[ISSUE_PRIORITIES.HIGH]: '#F44336',
	[ISSUE_STATUSES.CLOSED]: '#0C2F54'
};

export const ISSUE_STATUSES_ICONS = {
  [ISSUE_STATUSES.OPEN]: PanoramaFishEyeIcon,
  [ISSUE_STATUSES.IN_PROGRESS]: LensIcon,
  [ISSUE_STATUSES.FOR_APPROVAL]: AdjustIcon,
  [ISSUE_STATUSES.CLOSED]: CheckCircleIcon
};
