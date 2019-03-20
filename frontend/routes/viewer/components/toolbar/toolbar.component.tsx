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
import HomeIcon from '@material-ui/icons/Home';
import ClipIcon from '@material-ui/icons/Crop';
import FocusIcon from '@material-ui/icons/CenterFocusStrong';
import ShowAllIcon from '@material-ui/icons/Visibility';
import HideIcon from '@material-ui/icons/VisibilityOff';
import IsolateIcon from '@material-ui/icons/VisibilityOutlined';
import MetadataIcon from '@material-ui/icons/Info';
import TurntableIcon from '@material-ui/icons/Redo';
import { Helicopter, Ruler } from '../../../components/fontAwesomeIcon';

import { Container } from './toolbar.styles';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';

const MeasureIcon = () => <Ruler IconProps={{ className: 'fontSizeSmall' }} />;
const HelicopterIcon = () => <Helicopter IconProps={{ className: 'fontSizeSmall' }} />;

interface IProps {
}

export class Toolbar extends React.PureComponent<IProps, any> {
	public onExtentClick = () => {
		console.log('on click');
	}

	public get toolbarList() {
		return [
			{ label: 'Extent', Icon: HomeIcon, action: this.onExtentClick },
			{ label: 'Turntable', Icon: TurntableIcon, action: this.onExtentClick },
			{ label: 'Helicopter', Icon: HelicopterIcon, action: this.onExtentClick },
			{ label: 'Show All', Icon: ShowAllIcon, action: this.onExtentClick },
			{ label: 'Hide', Icon: HideIcon, action: this.onExtentClick },
			{ label: 'Isolate', Icon: IsolateIcon, action: this.onExtentClick, active: true },
			{ label: 'Focus', Icon: FocusIcon, action: this.onExtentClick },
			{ label: 'Clip', Icon: ClipIcon, action: this.onExtentClick },
			{ label: 'Measure', Icon: MeasureIcon, action: this.onExtentClick },
			{ label: 'BIM', Icon: MetadataIcon, action: this.onExtentClick }
		];
	}

	public renderButtons = () => this.toolbarList.map((buttonProps, index) =>
		<TooltipButton key={index} className="toolbarButton" {...buttonProps} />)

	public render() {
		return (
			<Container>
				{this.renderButtons()}
			</Container>
		);
	}
}
