import LensIcon from '@material-ui/icons/Lens';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import AdjustIcon from '@material-ui/icons/Adjust';

export const ISSUE_STATUS_COLORS = {
	NONE: '#777',
	LOW: '#4CAF50',
	MEDIUM: '#FF9800',
	HIGH: '#F44336'
};

export const ISSUE_STATUS_ICONS = {
	'open': PanoramaFishEyeIcon,
	'in progress': LensIcon,
	'for approval': AdjustIcon,
	'closed': CheckCircleIcon
};
