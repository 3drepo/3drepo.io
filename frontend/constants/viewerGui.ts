import CompareIcon from '@material-ui/icons/Compare';
import TreeIcon from '@material-ui/icons/DeviceHub';
import GroupsIcon from '@material-ui/icons/GroupWork';
import GisIcon from '@material-ui/icons/Layers';
import ViewsIcon from '@material-ui/icons/PhotoCamera';
import IssuesIcon from '@material-ui/icons/Place';
import RisksIcon from '@material-ui/icons/Warning';

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

export const VIEWER_PANELS_ICONS = {
	[VIEWER_PANELS.ISSUES]: IssuesIcon,
	[VIEWER_PANELS.RISKS]: RisksIcon,
	[VIEWER_PANELS.GROUPS]: GroupsIcon,
	[VIEWER_PANELS.VIEWS]: ViewsIcon,
	[VIEWER_PANELS.TREE]: TreeIcon,
	[VIEWER_PANELS.COMPARE]: CompareIcon,
	[VIEWER_PANELS.GIS]: GisIcon
};

export const VIEWER_PANELS_MIN_HEIGHTS = {
	[VIEWER_PANELS.ISSUES]: 200,
	[VIEWER_PANELS.RISKS]: 200,
	[VIEWER_PANELS.GROUPS]: 200,
	[VIEWER_PANELS.VIEWS]: 200,
	[VIEWER_PANELS.TREE]: 80,
	[VIEWER_PANELS.COMPARE]: 265,
	[VIEWER_PANELS.GIS]: 185
};

export const VIEWER_PANELS_TITLES = {
	[VIEWER_PANELS.ISSUES]: 'Issues',
	[VIEWER_PANELS.RISKS]: 'SafetiBase',
	[VIEWER_PANELS.GROUPS]: 'Groups',
	[VIEWER_PANELS.VIEWS]: 'Views',
	[VIEWER_PANELS.TREE]: 'Tree',
	[VIEWER_PANELS.COMPARE]: 'Compare',
	[VIEWER_PANELS.GIS]: 'GIS'
};

const getPanelConfig = (panelType) => ({
	name: VIEWER_PANELS_TITLES[panelType],
	icon: VIEWER_PANELS_ICONS[panelType],
	type: panelType
});

export const VIEWER_LEFT_PANELS = [
	VIEWER_PANELS.ISSUES,
	VIEWER_PANELS.RISKS,
	VIEWER_PANELS.GROUPS,
	VIEWER_PANELS.VIEWS,
	VIEWER_PANELS.TREE,
	VIEWER_PANELS.COMPARE,
	VIEWER_PANELS.GIS
].map(getPanelConfig);

export const VIEWER_RIGHT_PANELS = [
	VIEWER_PANELS.BIM
].map(getPanelConfig);
