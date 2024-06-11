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

import { ComponentType } from 'react';
import CompareIcon from '@mui/icons-material/Compare';
import TreeIcon from '@mui/icons-material/DeviceHub';
import GroupsIcon from '@mui/icons-material/GroupWork';
import GisIcon from '@mui/icons-material/Layers';
import SequencesIcon from '@mui/icons-material/Movie';
import ViewsIcon from '@mui/icons-material/PhotoCamera';
import IssuesIcon from '@mui/icons-material/Place';
import MeasureIcon from '@mui/icons-material/Straighten';
import TicketsIcon from '@assets/icons/filled/tickets-filled.svg';
import DrawingsIcon from '@assets/icons/outlined/drawings-outlined.svg';

import { RisksIcon } from '../routes/viewerGui/components/risks/components/riskIcon/riskIcon.component';

import { clientConfigService } from '../services/clientConfig';

export const VIEWER_PANELS = {
	GIS: 'gis',
	ISSUES: 'issues',
	RISKS: 'risks',
	TICKETS: 'tickets',
	BIM: 'bim',
	TREE: 'tree',
	GROUPS: 'groups',
	VIEWS: 'views',
	COMPARE: 'compare',
	SEQUENCES: 'sequences',
	MEASUREMENTS: 'measurements',
	DRAWINGS: 'drawings',
	ACTIVITIES: 'activities',
	LEGEND: 'legend',
};

export const VIEWER_PANELS_ICONS = {
	[VIEWER_PANELS.ISSUES]: IssuesIcon,
	[VIEWER_PANELS.RISKS]: RisksIcon,
	[VIEWER_PANELS.TICKETS]: TicketsIcon as ComponentType,
	[VIEWER_PANELS.GROUPS]: GroupsIcon,
	[VIEWER_PANELS.VIEWS]: ViewsIcon,
	[VIEWER_PANELS.TREE]: TreeIcon,
	[VIEWER_PANELS.COMPARE]: CompareIcon,
	[VIEWER_PANELS.GIS]: GisIcon,
	[VIEWER_PANELS.SEQUENCES]: SequencesIcon,
	[VIEWER_PANELS.MEASUREMENTS]: MeasureIcon,
	[VIEWER_PANELS.DRAWINGS]: DrawingsIcon as ComponentType,
};

export const VIEWER_PANELS_MIN_HEIGHTS = {
	[VIEWER_PANELS.ISSUES]: 200,
	[VIEWER_PANELS.RISKS]: 200,
	[VIEWER_PANELS.TICKETS]: 200,
	[VIEWER_PANELS.GROUPS]: 200,
	[VIEWER_PANELS.VIEWS]: 200,
	[VIEWER_PANELS.TREE]: 80,
	[VIEWER_PANELS.COMPARE]: 265,
	[VIEWER_PANELS.GIS]: 185,
	[VIEWER_PANELS.SEQUENCES]: 200,
	[VIEWER_PANELS.MEASUREMENTS]: 200,
	[VIEWER_PANELS.DRAWINGS]: 200,
};

export const VIEWER_PANELS_TITLES = {
	[VIEWER_PANELS.ISSUES]: 'Issues',
	[VIEWER_PANELS.RISKS]: 'SafetiBase',
	[VIEWER_PANELS.TICKETS]: 'Tickets',
	[VIEWER_PANELS.GROUPS]: 'Groups',
	[VIEWER_PANELS.VIEWS]: 'Views',
	[VIEWER_PANELS.TREE]: 'Tree',
	[VIEWER_PANELS.COMPARE]: 'Compare',
	[VIEWER_PANELS.GIS]: 'GIS',
	[VIEWER_PANELS.SEQUENCES]: 'Sequences',
	[VIEWER_PANELS.MEASUREMENTS]: 'Measurements',
	[VIEWER_PANELS.DRAWINGS]: 'Drawings',
};

const getPanelConfig = (panelType) => ({
	name: VIEWER_PANELS_TITLES[panelType],
	icon: VIEWER_PANELS_ICONS[panelType],
	type: panelType
});

export const getViewerLeftPanels = () =>  [
	VIEWER_PANELS.ISSUES,
	VIEWER_PANELS.RISKS,
	VIEWER_PANELS.TICKETS,
	VIEWER_PANELS.GROUPS,
	VIEWER_PANELS.VIEWS,
	VIEWER_PANELS.TREE,
	VIEWER_PANELS.COMPARE,
	VIEWER_PANELS.GIS,
	VIEWER_PANELS.SEQUENCES,
	VIEWER_PANELS.MEASUREMENTS,
	VIEWER_PANELS.DRAWINGS,
].filter((panel) =>
(clientConfigService.sequencesEnabled || panel !== VIEWER_PANELS.SEQUENCES)).map(getPanelConfig);

export const getCalibrationViewerLeftPanels = () =>  [
	VIEWER_PANELS.GROUPS,
	VIEWER_PANELS.VIEWS,
	VIEWER_PANELS.TREE,
].filter((panel) =>
(clientConfigService.sequencesEnabled || panel !== VIEWER_PANELS.SEQUENCES)).map(getPanelConfig);

export const VIEWER_DRAGGABLE_PANELS = [
	VIEWER_PANELS.LEGEND,
];

export const VIEWER_RIGHT_PANELS = [
	VIEWER_PANELS.BIM,
	VIEWER_PANELS.ACTIVITIES,
].map(getPanelConfig);

export const VIEWER_PANEL_TITLE_HEIGHT = 40;

export const LONG_TEXT_CHAR_LIM = 1200;
