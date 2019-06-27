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
import { isEmpty } from 'lodash';

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
	match: {
		params: {
			model: string;
			teamspace: string;
			revision?: string;
		}
	};
	queryParams: {
		issueId?: string;
		riskId?: string;
	};
}

// model.pug

export class ViewerGui extends React.PureComponent<IProps, any> {
	public state = {
		visiblePanels: {}
	};

	public componentDidMount() {
		const changes = {} as any;
		const { issueId, riskId } = this.props.queryParams;

		if (issueId || riskId) {
			changes.visiblePanels = {};
			if (issueId) {
				changes.visiblePanels[VIEWER_PANELS.ISSUES] = true;
			}
			if (riskId) {
				changes.visiblePanels[VIEWER_PANELS.RISKS] = true;
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	private get urlParams() {
		return this.props.match.params;
	}

	public render() {
		return (
			<Container className={this.props.className}>
				<RevisionsDropdown />
				<Toolbar {...this.urlParams.teamspace} />
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
			{visiblePanels[VIEWER_PANELS.ISSUES] && <Issues {...this.urlParams.teamspace} />}
			{visiblePanels[VIEWER_PANELS.RISKS] && <Risks {...this.urlParams.teamspace} />}
			{visiblePanels[VIEWER_PANELS.GROUPS] && <Groups {...this.urlParams.teamspace} />}
			{visiblePanels[VIEWER_PANELS.VIEWS] && <Views {...this.urlParams.teamspace} />}
			{visiblePanels[VIEWER_PANELS.TREE] && <Tree {...this.urlParams.teamspace} />}
			{visiblePanels[VIEWER_PANELS.COMPARE] && <Compare {...this.urlParams.teamspace} />}
			{visiblePanels[VIEWER_PANELS.GIS] && <Gis {...this.urlParams.teamspace} />}
		</LeftPanels>
	)
}
