import LensIcon from '@material-ui/icons/Lens';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import AdjustIcon from '@material-ui/icons/Adjust';

export const ISSUE_PANEL_NAME = 'issue';

const STATUSES = {
	OPEN: 'open',
	IN_PROGRESS: 'in progress',
	FOR_APPROVAL: 'for approval',
  CLOSED: 'closed'
};

const PRIORITIES = {
	NONE: 'none',
	LOW: 'low',
	MEDIUM: 'medium',
	HIGH: 'high'
};

export const ISSUE_TOPIC_TYPES = [
	{ value: 'clash', name: 'Clash' },
	{ value: 'diff', name: 'Diff' },
	{ value: 'rfi', name: 'RFI' },
	{ value: 'risk', name: 'Risk' },
	{ value: 'hs', name: 'H&S' },
	{ value: 'design', name: 'Design' },
	{ value: 'constructibility', name: 'Constructibility' },
	{ value: 'gis', name: 'GIS' },
	{ value: 'for_information', name: 'For information' },
	{ value: 'vr', name: 'VR' }
];

export const ISSUE_STATUSES = [
	{ value: STATUSES.OPEN, name: 'Open' },
	{ value: STATUSES.IN_PROGRESS, name: 'In progress'},
	{ value: STATUSES.FOR_APPROVAL, name: 'For approval' },
	{ value: STATUSES.CLOSED, name: 'Closed' }
];

export const ISSUE_PRIORITIES = [
	{ value: PRIORITIES.NONE, name: 'None' },
	{ value: PRIORITIES.LOW, name: 'Low'},
	{ value: PRIORITIES.MEDIUM, name: 'Medium' },
	{ value: PRIORITIES.HIGH, name: 'High' }
];

export const STATUSES_COLORS = {
	[PRIORITIES.NONE]: '#777777',
	[PRIORITIES.LOW]: '#4CAF50',
	[PRIORITIES.MEDIUM]: '#FF9800',
	[PRIORITIES.HIGH]: '#F44336',
	[STATUSES.CLOSED]: '#0C2F54'
};

export const STATUSES_ICONS = {
  [STATUSES.OPEN]: PanoramaFishEyeIcon,
  [STATUSES.IN_PROGRESS]: LensIcon,
  [STATUSES.FOR_APPROVAL]: AdjustIcon,
  [STATUSES.CLOSED]: CheckCircleIcon
};
