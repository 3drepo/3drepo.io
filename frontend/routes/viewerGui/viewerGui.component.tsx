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
import { IViewerContext } from '../../contexts/viewer.context';
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
import { CloseFocusModeButton } from './components/closeFocusModeButton';

interface IProps {
	className?: string;
	viewer: IViewerContext,
	modelSettings: any;
	isModelPending: boolean;
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
	startListenOnSelections: () => void;
	stopListenOnSelections: () => void;
	startListenOnModelLoaded: () => void;
	stopListenOnModelLoaded: () => void;
	fetchData: (teamspace, model, revision?) => void;
	loadModel: (teamspace, model, revision?) => void;
	resetPanelsStates: () => void;
}

interface IState {
	loadedModelId: string;
	visiblePanels: any;
}

export class ViewerGui extends React.PureComponent<IProps, IState> {
	public state = {
		visiblePanels: {},
		loadedModelId: null
	};

	public componentDidMount() {
		const changes = {} as IState;
		const { modelSettings, queryParams: { issueId, riskId }, match: { params } } = this.props;

		if (issueId || riskId) {
			changes.visiblePanels = {};
			if (issueId) {
				changes.visiblePanels[VIEWER_PANELS.ISSUES] = true;
			}
			if (riskId) {
				changes.visiblePanels[VIEWER_PANELS.RISKS] = true;
			}
		}

		this.props.startListenOnSelections();
		this.props.startListenOnModelLoaded();
		this.props.fetchData(params.teamspace, params.model, params.revision);

		if (!isEmpty(changes)) {
			this.setState(changes);
		}

	}

	public componentDidUpdate(prevProps: IProps, prevState: IState) {
		const changes = {} as IState;
		const { modelSettings, isModelPending, match: { params } } = this.props;
		const teamspaceChanged = params.teamspace !== prevProps.match.params.teamspace;
		const modelChanged = params.model !== prevProps.match.params.model;

		if (teamspaceChanged || modelChanged) {
			this.props.fetchData(params.teamspace, params.model, params.revision);
		}

		const settingsChanged = modelSettings._id !== prevState.loadedModelId;
		if (!isModelPending && settingsChanged) {
			changes.loadedModelId = modelSettings._id;
			this.handleModelSettingsChange(modelSettings);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		this.props.stopListenOnSelections();
		this.props.stopListenOnModelLoaded();
		this.props.resetPanelsStates();
	}

	private get urlParams() {
		return this.props.match.params;
	}

	public render() {
		return (
			<Container className={this.props.className}>
				<RevisionsDropdown />
				<CloseFocusModeButton />
				<Toolbar {...this.urlParams.teamspace} />
				{this.renderLeftPanelsButtons()}
				{this.renderLeftPanels(this.state.visiblePanels)}
			</Container>
		);
	}

	private handleModelSettingsChange(modelSettings) {
		const { teamspace, model, revision } = this.props.match.params;
		console.error('handleModelSettingsChange')
		//TODO: this.PanelService.hideSubModels(this.issuesCardIndex, !modelSettings.federate);
		this.props.loadModel(teamspace, model, revision);
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
