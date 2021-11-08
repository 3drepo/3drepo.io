/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import CompareIcon from '@material-ui/icons/Compare';
import TreeIcon from '@material-ui/icons/DeviceHub';
import GroupsIcon from '@material-ui/icons/GroupWork';
import GisIcon from '@material-ui/icons/Layers';
import SequencesIcon from '@material-ui/icons/Movie';
import ViewsIcon from '@material-ui/icons/PhotoCamera';
import IssuesIcon from '@material-ui/icons/Place';
import MeasureIcon from '@material-ui/icons/Straighten';
import { RisksIcon } from '../routes/viewerGui/components/risks/components/riskIcon/riskIcon.component';

import { clientConfigService } from '../services/clientConfig';

export const VIEWER_PANELS = {
	GIS: 'gis',
	ISSUES: 'issues',
	RISKS: 'risks',
	BIM: 'bim',
	TREE: 'tree',
	GROUPS: 'groups',
	VIEWS: 'views',
	COMPARE: 'compare',
	SEQUENCES: 'sequences',
	MEASUREMENTS: 'measurements',
	ACTIVITIES: 'activities',
	LEGEND: 'legend',
};

export const VIEWER_PANELS_ICONS = {
	[VIEWER_PANELS.ISSUES]: IssuesIcon,
	[VIEWER_PANELS.RISKS]: RisksIcon,
	[VIEWER_PANELS.GROUPS]: GroupsIcon,
	[VIEWER_PANELS.VIEWS]: ViewsIcon,
	[VIEWER_PANELS.TREE]: TreeIcon,
	[VIEWER_PANELS.COMPARE]: CompareIcon,
	[VIEWER_PANELS.GIS]: GisIcon,
	[VIEWER_PANELS.SEQUENCES]: SequencesIcon,
	[VIEWER_PANELS.MEASUREMENTS]: MeasureIcon,
};

export const VIEWER_PANELS_MIN_HEIGHTS = {
	[VIEWER_PANELS.ISSUES]: 200,
	[VIEWER_PANELS.RISKS]: 200,
	[VIEWER_PANELS.GROUPS]: 200,
	[VIEWER_PANELS.VIEWS]: 200,
	[VIEWER_PANELS.TREE]: 80,
	[VIEWER_PANELS.COMPARE]: 265,
	[VIEWER_PANELS.GIS]: 185,
	[VIEWER_PANELS.SEQUENCES]: 200,
	[VIEWER_PANELS.MEASUREMENTS]: 200,
};

export const VIEWER_PANELS_TITLES = {
	[VIEWER_PANELS.ISSUES]: 'Issues',
	[VIEWER_PANELS.RISKS]: 'SafetiBase',
	[VIEWER_PANELS.GROUPS]: 'Groups',
	[VIEWER_PANELS.VIEWS]: 'Views',
	[VIEWER_PANELS.TREE]: 'Tree',
	[VIEWER_PANELS.COMPARE]: 'Compare',
	[VIEWER_PANELS.GIS]: 'GIS',
	[VIEWER_PANELS.SEQUENCES]: 'Sequences',
	[VIEWER_PANELS.MEASUREMENTS]: 'Measurements',
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
	VIEWER_PANELS.GIS,
	VIEWER_PANELS.SEQUENCES,
	VIEWER_PANELS.MEASUREMENTS,
].filter((panel) => clientConfigService.sequencesEnabled || panel !== VIEWER_PANELS.SEQUENCES).map(getPanelConfig);

export const VIEWER_DRAGGABLE_PANELS = [
	VIEWER_PANELS.LEGEND,
];

export const VIEWER_RIGHT_PANELS = [
	VIEWER_PANELS.BIM,
	VIEWER_PANELS.ACTIVITIES,
].map(getPanelConfig);

export const VIEWER_PANEL_TITLE_HEIGHT = 40;

export const LONG_TEXT_CHAR_LIM = 1200;
