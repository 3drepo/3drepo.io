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

import CompareIcon from '@material-ui/icons/Compare';
import TreeIcon from '@material-ui/icons/DeviceHub';
import GroupsIcon from '@material-ui/icons/GroupWork';
import GisIcon from '@material-ui/icons/Layers';
import ViewsIcon from '@material-ui/icons/PhotoCamera';
import IssuesIcon from '@material-ui/icons/Place';
import RisksIcon from '@material-ui/icons/Warning';
import React from 'react';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { Container } from './panelsMenu.styles';

interface IState {
	activePanels: any;
}

const PANELS = {
	ISSUES: 'Issues',
	RISKS: 'SafetiBase',
	GROUPS: 'Groups',
	VIEWS: 'Views',
	TREE: 'Tree',
	COMPARE: 'Compare',
	GIS: 'GIS'
};

export class PanelsMenu extends React.PureComponent<any, IState> {
	public state = {
		activePanels: {}
	};

	public get toolbarList() {
		return [
			{ label: PANELS.ISSUES, Icon: IssuesIcon, action: () => this.togglePanel(PANELS.ISSUES) },
			{ label: PANELS.RISKS, Icon: RisksIcon, action: () => this.togglePanel(PANELS.RISKS) },
			{ label: PANELS.GROUPS, Icon: GroupsIcon, action: () => this.togglePanel(PANELS.GROUPS) },
			{ label: PANELS.VIEWS, Icon: ViewsIcon, action: () => this.togglePanel(PANELS.VIEWS) },
			{ label: PANELS.TREE, Icon: TreeIcon, action: () => this.togglePanel(PANELS.TREE) },
			{ label: PANELS.COMPARE, Icon: CompareIcon, action: () => this.togglePanel(PANELS.COMPARE)},
			{ label: PANELS.GIS, Icon: GisIcon, action: () => this.togglePanel(PANELS.GIS) }
		];
	}

	public render() {
		return (
			<Container>
				{this.renderButtons()}
			</Container>
		);
	}

	private renderButtons = () => this.toolbarList.map((buttonProps, index) => (
		<TooltipButton
			{...buttonProps}
			key={index}
			className="panelButton"
			placement="right-end"
			active={this.state.activePanels[buttonProps.label]}
		/>
	))

	private togglePanel = (panel) => {
		this.setState((prevState) => ({
				activePanels: {...prevState.activePanels, [panel]: !prevState.activePanels[panel]}
			})
		);
	}

}
