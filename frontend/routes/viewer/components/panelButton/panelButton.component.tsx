/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import IssuesIcon from '@material-ui/icons/Place';
import RisksIcon from '@material-ui/icons/Warning';
import GroupsIcon from '@material-ui/icons/GroupWork';
import CompareIcon from '@material-ui/icons/Compare';
import GisIcon from '@material-ui/icons/Layers';
import ViewsIcon from '@material-ui/icons/PhotoCamera';
import TreeIcon from '@material-ui/icons/DeviceHub';

import { runAngularTimeout } from '../../../../helpers/migration';
import { Button } from './panelButton.styles';

const IconsMap = {
	place: IssuesIcon,
	report_problem: RisksIcon,
	group_work: GroupsIcon,
	camera_alt: ViewsIcon,
	device_hub: TreeIcon,
	compare: CompareIcon,
	layers: GisIcon
};

export const PanelButton = (props) => {
	const { active, icon, label, onClick, type } = props;

	return (
		<Button
			label={label}
			Icon={IconsMap[icon]}
			placement="right-end"
			active={Boolean(active)}
			action={() => runAngularTimeout(() => onClick(type))}
		/>
	);
};
