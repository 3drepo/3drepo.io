/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.ś
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
import Splitter from 'm-react-splitters';
import 'm-react-splitters/lib/splitters.css';

import { VIEWER_LEFT_PANELS, VIEWER_PANELS } from '../../constants/viewerGui';
import Toolbar from './components/toolbar/toolbar.container';
import Gis from './components/gis/gis.container';
import { Views } from './components/views';
import { Risks } from './components/risks';
import { Groups } from './components/groups';
import { Issues } from './components/issues';
import { Compare } from './components/compare';
import { Tree } from './components/tree';
import { PanelButton } from './components/panelButton/panelButton.component';
import { RevisionsDropdown } from './components/revisionsDropdown';
import { Container, LeftPanels, LeftPanelsButtons } from './viewerGui.styles';

interface IProps {
	className?: string;
}

// model.pug

export class ViewerGui extends React.PureComponent<IProps, any> {
	public state = {
		visiblePanels: {}
	};

	public render() {
		return (
			<Container className={this.props.className}>
				<RevisionsDropdown />
				<Toolbar
					/* ng-if="!vm.isLiteMode" */
					/* style="pointer-events:{{vm.pointerEvents}}" */
					teamspace="vm.account"
					model="vm.model"
				/>
				{this.renderLeftPanelsButtons()}
				{this.renderLeftPanels(this.state.visiblePanels)}
			</Container>
		);
	}

	private handleTogglePanel = (panelType) => {
		this.setState(({ visiblePanels }) => ({
			visiblePanels: {
				...visiblePanels,
				[panelType]: !visiblePanels[panelType]
			}
		}));
	}

	private renderLeftPanelsButtons = () => (
		<LeftPanelsButtons>
			{VIEWER_LEFT_PANELS.map(({ name, type }) => (
				<PanelButton
					key={type}
					onClick={this.handleTogglePanel}
					label={name}
					type={type}
					active={this.state.visiblePanels[type]}
				/>
			))}
		</LeftPanelsButtons>
	)

	private renderLeftPanels = (visiblePanels) => (
		<LeftPanels>
			{visiblePanels[VIEWER_PANELS.ISSUES] && <Issues />}
			{visiblePanels[VIEWER_PANELS.RISKS] && <Risks />}
			{visiblePanels[VIEWER_PANELS.GROUPS] && <Groups />}
			{visiblePanels[VIEWER_PANELS.VIEWS] && <Views />}
			{visiblePanels[VIEWER_PANELS.TREE] && <Tree />}
			{visiblePanels[VIEWER_PANELS.COMPARE] && <Compare />}
			{visiblePanels[VIEWER_PANELS.GIS] && <Gis />}
		</LeftPanels>
	)
}
