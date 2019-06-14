import IssuesIcon from '@material-ui/icons/Place';
import RisksIcon from '@material-ui/icons/Warning';
import GroupsIcon from '@material-ui/icons/GroupWork';
import CompareIcon from '@material-ui/icons/Compare';
import GisIcon from '@material-ui/icons/Layers';
import ViewsIcon from '@material-ui/icons/PhotoCamera';
import TreeIcon from '@material-ui/icons/DeviceHub';

export const VIEWER_PANELS = {
	GIS: 'gis',
	ISSUES: 'issues',
	RISKS: 'risks',
	BIM: 'bim',
	TREE: 'tree',
	GROUPS: 'groups',
	VIEWS: 'views',
	COMPARE: 'compare'
};

export const VIEWER_LEFT_PANELS = [
	VIEWER_PANELS.ISSUES,
	VIEWER_PANELS.RISKS,
	VIEWER_PANELS.GROUPS,
	VIEWER_PANELS.VIEWS,
	VIEWER_PANELS.TREE,
	VIEWER_PANELS.COMPARE,
	VIEWER_PANELS.GIS
];

export const VIEWER_RIGHT_PANELS = [
	VIEWER_PANELS.BIM
];

export const VIEWER_PANELS_ICONS = {
	[VIEWER_PANELS.ISSUES]: IssuesIcon,
	[VIEWER_PANELS.RISKS]: RisksIcon,
	[VIEWER_PANELS.GROUPS]: GroupsIcon,
	[VIEWER_PANELS.VIEWS]: ViewsIcon,
	[VIEWER_PANELS.TREE]: TreeIcon,
	[VIEWER_PANELS.COMPARE]: CompareIcon,
	[VIEWER_PANELS.GIS]: GisIcon
};
