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
import { Container } from './panelsMenu.styles';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';

interface IProps {
}

export class PanelsMenu extends React.PureComponent<IProps, any> {
	public handleClick = () => {
		console.log('on click');
	}

	public get toolbarList() {
		return [
			{ label: 'Issues', Icon: IssuesIcon, action: this.handleClick },
			{ label: 'SafetiBase', Icon: RisksIcon, action: this.handleClick },
			{ label: 'Groups', Icon: GroupsIcon, action: this.handleClick, active: true },
			{ label: 'Views', Icon: ViewsIcon, action: this.handleClick },
			{ label: 'Tree', Icon: TreeIcon, action: this.handleClick },
			{ label: 'Compare', Icon: CompareIcon, action: this.handleClick},
			{ label: 'GIS', Icon: GisIcon, action: this.handleClick }
		];
	}

	public renderButtons = () => this.toolbarList.map((buttonProps, index) =>
		<TooltipButton key={index} className="panelButton" {...buttonProps} placement="right-end" />)

	public render() {
		return (
			<Container>
				{this.renderButtons()}
			</Container>
		);
	}
}
