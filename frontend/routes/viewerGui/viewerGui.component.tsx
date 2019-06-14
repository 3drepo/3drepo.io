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
import { cond, constant, matches } from 'lodash';
import PinDrop from '@material-ui/icons/PinDrop';
import ReportProblem from '@material-ui/icons/ReportProblem';


import Toolbar from './components/toolbar/toolbar.container';
import Gis from './components/gis/gis.container';
import { Views } from './components/views';
import { Container, LeftPanels, LeftPanelsButtons } from './viewerGui.styles';
import { Risks } from './components/risks';
import { Groups } from './components/groups';
import { Issues } from './components/issues';
import { Compare } from './components/compare';
import { Tree } from './components/tree';
import { VIEWER_LEFT_PANELS } from '../../constants/viewerGui';
import { PanelButton } from './components/panelButton/panelButton.component';

interface IProps {
	className?: string;
}

// model.pug

export class ViewerGui extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<Container className={this.props.className}>
				<Toolbar
					/* ng-if="!vm.isLiteMode" */
					/* style="pointer-events:{{vm.pointerEvents}}" */
					teamspace="vm.account"
					model="vm.model"
				/>
				{this.renderLeftPanelsButtons()}
{/* 				{this.renderLeftPanels()} */}
			</Container>
		);
	}

	private handleTogglePanel = (panelType) => {

	}

	private renderLeftPanelsButtons = () => (
		<LeftPanelsButtons>
			{VIEWER_LEFT_PANELS.map((panelType) => (
				<PanelButton
					key={panelType}
					onClick={this.handleTogglePanel}
					label="contentItem.title"
					type={panelType}
					active={true}
				/>
			))}
		</LeftPanelsButtons>
	);


	private renderLeftPanels = () => (
		<LeftPanels>
			<Gis
				/* ng-if="contentItem.type === 'gis'" */
			/>
			<Views 
/* 				ng-if="contentItem.type === 'viewpoints'"
				teamspace="vm.account"
				model-id="vm.model" */
			/>
			<Risks
/* 				ng-if="contentItem.type === 'risks'"
				teamspace="vm.account"
				model="vm.model"
				revision="vm.revision" */
			/>
			<Groups
/* 				ng-if="contentItem.type === 'groups'"
				teamspace="vm.account"
				model="vm.model"
				revision="vm.revision" */
			/>
			<Issues
/* 				ng-if="contentItem.type === 'issues'"
				teamspace="vm.account"
				model="vm.model"
				revision="vm.revision" */
			/>
			<Compare
/* 				ng-if="contentItem.type === 'compare'"
				teamspace="vm.account"
				model="vm.model"
				revision="vm.revision" */
			/>
			<Tree
				/* ng-if="contentItem.type === 'tree'"
				teamspace="vm.account"
				model="vm.model"
				revision="vm.revision" */
			/>
		</LeftPanels>
	)
}
