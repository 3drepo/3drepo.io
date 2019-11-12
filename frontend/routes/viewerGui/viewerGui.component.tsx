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

import { isEmpty } from 'lodash';
import React from 'react';

import { VIEWER_LEFT_PANELS, VIEWER_PANELS } from '../../constants/viewerGui';
import { renderWhenTrue } from '../../helpers/rendering';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { Bim } from './components/bim';
import { CloseFocusModeButton } from './components/closeFocusModeButton';
import { Compare } from './components/compare';
import Gis from './components/gis/gis.container';
import { Groups } from './components/groups';
import { Issues } from './components/issues';
import { PanelButton } from './components/panelButton/panelButton.component';
import RevisionsSwitch from './components/revisionsSwitch/revisionsSwitch.container';
import { Risks } from './components/risks';
import Toolbar from './components/toolbar/toolbar.container';
import { Tree } from './components/tree';
import { ViewerLoader } from './components/viewerLoader';
import { Views } from './components/views';
import { Container, GuiContainer, LeftPanels, LeftPanelsButtons, RightPanels } from './viewerGui.styles';

interface IProps {
	viewer: any;
	className?: string;
	modelSettings: any;
	isModelPending: boolean;
	isFocusMode: boolean;
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
	visiblePanels: any;
	stopListenOnSelections: () => void;
	stopListenOnModelLoaded: () => void;
	stopListenOnClickPin: () => void;
	fetchData: (teamspace, model) => void;
	loadModel: () => void;
	resetPanelsStates: () => void;
	resetModel: () => void;
	setPanelVisibility: (panelName, visibility) => void;
}

interface IState {
	loadedModelId: string;
	showLoader: boolean;
	loaderType: string;
	loaderProgress: number;
}

export class ViewerGui extends React.PureComponent<IProps, IState> {

	private get urlParams() {
		return this.props.match.params;
	}
	public state = {
		loadedModelId: null,
		showLoader: false,
		loaderType: null,
		loaderProgress: 0
	};

	public renderViewerLoader = renderWhenTrue(() => <ViewerLoader />);

	public componentDidMount() {
		const { queryParams: { issueId, riskId }, match: { params }, viewer } = this.props;

		viewer.init();

		if (issueId || !riskId) {
			this.props.setPanelVisibility(VIEWER_PANELS.ISSUES, true);
		}
		if (riskId) {
			this.props.setPanelVisibility(VIEWER_PANELS.RISKS, true);
		}

		MultiSelect.initKeyWatchers();
		this.props.fetchData(params.teamspace, params.model);
	}

	public componentDidUpdate(prevProps: IProps, prevState: IState) {
		const changes = {} as IState;
		const { match: { params }, queryParams } = this.props;
		const teamspaceChanged = params.teamspace !== prevProps.match.params.teamspace;
		const modelChanged = params.model !== prevProps.match.params.model;
		const revisionChanged = params.revision !== prevProps.match.params.revision;

		const { issueId, riskId } = queryParams;

		if (issueId !== prevProps.queryParams.issueId && issueId) {
			this.props.setPanelVisibility(VIEWER_PANELS.ISSUES, true);
		}
		if (riskId !== prevProps.queryParams.riskId && riskId) {
			this.props.setPanelVisibility(VIEWER_PANELS.RISKS, true);
		}

		if (teamspaceChanged || modelChanged || revisionChanged) {
			this.props.fetchData(params.teamspace, params.model);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		MultiSelect.removeKeyWatchers();
		this.props.stopListenOnSelections();
		this.props.stopListenOnModelLoaded();
		this.props.stopListenOnClickPin();
		this.props.resetPanelsStates();
		this.props.viewer.destroy();
		this.props.resetModel();
	}

	public render() {
		const { visiblePanels, isFocusMode, viewer } = this.props;

		return (
			<GuiContainer>
				<CloseFocusModeButton isFocusMode={isFocusMode} />
				<Container className={this.props.className} hidden={isFocusMode}>
					<RevisionsSwitch />
					<Toolbar {...this.urlParams} />
					{this.renderLeftPanelsButtons()}
					{this.renderLeftPanels(visiblePanels)}
					{this.renderRightPanels(visiblePanels)}
					{this.renderViewerLoader(viewer.hasInstance)}
				</Container>
			</GuiContainer>
		);
	}

	private handleTogglePanel = (panelType) => {
		this.props.setPanelVisibility(panelType, !this.props.visiblePanels[panelType]);
	}

	private renderLeftPanelsButtons = () => (
		<LeftPanelsButtons>
			{VIEWER_LEFT_PANELS.map(({ name, type }) => (
				<PanelButton
					key={type}
					onClick={this.handleTogglePanel}
					label={name}
					type={type}
					active={this.props.visiblePanels[type]}
				/>
			))}
		</LeftPanelsButtons>
	)

	private renderLeftPanels = (visiblePanels) => (
		<LeftPanels>
			{visiblePanels[VIEWER_PANELS.ISSUES] && <Issues {...this.urlParams} />}
			{visiblePanels[VIEWER_PANELS.RISKS] && <Risks {...this.urlParams} />}
			{visiblePanels[VIEWER_PANELS.GROUPS] && <Groups {...this.urlParams} />}
			{visiblePanels[VIEWER_PANELS.VIEWS] && <Views {...this.urlParams} />}
			{visiblePanels[VIEWER_PANELS.TREE] && <Tree {...this.urlParams} />}
			{visiblePanels[VIEWER_PANELS.COMPARE] && <Compare {...this.urlParams} />}
			{visiblePanels[VIEWER_PANELS.GIS] && <Gis {...this.urlParams} />}
		</LeftPanels>
	)

	private renderRightPanels = (visiblePanels) => (
		<RightPanels>
			{visiblePanels[VIEWER_PANELS.BIM] && <Bim {...this.urlParams} />}
		</RightPanels>
	)
}
