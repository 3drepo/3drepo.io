/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { Tickets } from '@/v5/ui/routes/viewer/tickets/tickets.component';
import { isEmpty, isEqual } from 'lodash';
import { PureComponent } from 'react';
import { Toolbar } from '@/v5/ui/routes/viewer/toolbar/toolbar.component';
import { AdditionalProperties, TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { goToView } from '@/v5/helpers/viewpoint.helpers';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { AddOn } from '@/v5/store/store.types';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { getViewerLeftPanels, VIEWER_PANELS } from '../../constants/viewerGui';
import { getWindowHeight, getWindowWidth, renderWhenTrue } from '../../helpers/rendering';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { Activities } from './components/activities/';
import { Bim } from './components/bim';
import { CloseFocusModeButton } from './components/closeFocusModeButton';
import { Compare } from './components/compare';
import Gis from './components/gis/gis.container';
import { Groups } from './components/groups';
import { Issues } from './components/issues';
import { Legend } from './components/legend';
import { PANEL_DEFAULT_WIDTH } from './components/legend/legend.constants';
import { Measurements } from './components/measurements';
import { PanelButton } from './components/panelButton/panelButton.component';
import RevisionsSwitch from './components/revisionsSwitch/revisionsSwitch.container';
import { Risks } from './components/risks';
import Sequences from './components/sequences/sequences.container';
import { Tree } from './components/tree';
import { ViewerLoader } from './components/viewerLoader';
import { Views } from './components/views';
import { Container, DraggablePanels, GuiContainer, LeftPanels, LeftPanelsButtons, RightPanels } from './viewerGui.styles';

interface IProps {
	viewer: any;
	className?: string;
	currentTeamspace: string;
	modelSettings: any;
	isModelPending: boolean;
	isPresentationActive: boolean;
	isFocusMode: boolean;
	match: {
		params: {
			model: string;
			teamspace: string;
			project?: string;
			revision?: string;
		}
	};
	queryParams: {
		issueId?: string;
		riskId?: string;
		presenter?: string;
	};
	leftPanels: string[];
	rightPanels: string[];
	draggablePanels: string[];
	selectedTicket: ITicket | undefined;
	treeNodesList: any;
	ticketsCardView: TicketsCardViews;
	isEditingGroups: boolean;
	issuesEnabled: boolean;
	risksEnabled: boolean;
	stopListenOnSelections: () => void;
	stopListenOnModelLoaded: () => void;
	stopListenOnClickPin: () => void;
	fetchData: (teamspace, model) => void;
	fetchTeamspaces: (username) => void;
	resetPanelsStates: () => void;
	resetModel: () => void;
	setPanelVisibility: (panelName, visibility?) => void;
	removeMeasurement: (uuid) => void;
	resetViewerGui: () => void;
	resetCompareComponent: () => void;
	joinPresentation: (code) => void;
	subscribeOnIssueChanges: (teamspace, modelId) => void;
	unsubscribeOnIssueChanges: (teamspace, modelId) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
	setProjectionModeSuccess: (mode) => void;
	clearCurrentlySelected: () => void;
}

interface IState {
	loadedModelId: string;
	showLoader: boolean;
	loaderType: string;
	loaderProgress: number;
}

export class ViewerGui extends PureComponent<IProps, IState> {

	private get urlParams() {
		return this.props.match.params;
	}

	private get minPanelHeight() {
		const height = getWindowHeight() * 0.3;
		return height < 300 ? 300 : height;
	}

	public state = {
		loadedModelId: null,
		showLoader: false,
		loaderType: null,
		loaderProgress: 0
	};

	public renderViewerLoader = renderWhenTrue(() => <ViewerLoader />);

	public componentDidMount() {
		const {
			queryParams: { issueId, riskId, presenter },
			match: { params },
			viewer,
			leftPanels,
			currentTeamspace,
			fetchTeamspaces,
		} = this.props;

		viewer.init();

		if (issueId && !leftPanels.includes(VIEWER_PANELS.ISSUES)) {
			this.props.setPanelVisibility(VIEWER_PANELS.ISSUES, true);
		}

		if (riskId && !leftPanels.includes(VIEWER_PANELS.RISKS)) {
			this.props.setPanelVisibility(VIEWER_PANELS.RISKS, true);
		}

		MultiSelect.initKeyWatchers();
		this.props.fetchData(params.teamspace, params.model);
		this.props.subscribeOnIssueChanges(params.teamspace, params.model);
		this.props.subscribeOnRiskChanges(params.teamspace, params.model);
		this.toggleViewerListeners(true);

		if (presenter) {
			this.props.joinPresentation(presenter);
		}

		fetchTeamspaces(currentTeamspace);
		this.props.viewer.on(VIEWER_EVENTS.CAMERA_PROJECTION_SET, this.props.setProjectionModeSuccess);
	}

	public componentDidUpdate(prevProps: IProps, prevState: IState) {
		const changes = {} as IState;
		const { match: { params }, queryParams, leftPanels } = this.props;
		const teamspaceChanged = params.teamspace !== prevProps.match.params.teamspace;
		const modelChanged = params.model !== prevProps.match.params.model;
		const revisionChanged = params.revision !== prevProps.match.params.revision;
		const presentationActivityChanged = prevProps.isPresentationActive !== this.props.isPresentationActive;

		const { issueId, riskId } = queryParams;

		if (issueId !== prevProps.queryParams.issueId && issueId && !leftPanels.includes(VIEWER_PANELS.ISSUES)) {
			this.props.setPanelVisibility(VIEWER_PANELS.ISSUES, true);
		}
		if (riskId !== prevProps.queryParams.riskId && riskId && !leftPanels.includes(VIEWER_PANELS.RISKS)) {
			this.props.setPanelVisibility(VIEWER_PANELS.RISKS, true);
		}

		if (teamspaceChanged || modelChanged || revisionChanged) {
			this.props.resetPanelsStates();
			this.props.unsubscribeOnIssueChanges(prevProps.match.params.teamspace, prevProps.match.params.model);
			this.props.unsubscribeOnRiskChanges(prevProps.match.params.teamspace, prevProps.match.params.model);
			this.props.fetchData(params.teamspace, params.model);
			this.props.subscribeOnIssueChanges(params.teamspace, params.model);
			this.props.subscribeOnRiskChanges(params.teamspace, params.model);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}

		if (presentationActivityChanged && this.props.isPresentationActive) {
			this.props.setPanelVisibility(VIEWER_PANELS.COMPARE, false);
			this.props.resetCompareComponent();
		}

		if (this.props.isEditingGroups) {
			return;
		}

		const prevView = prevProps.selectedTicket?.properties?.[AdditionalProperties.DEFAULT_VIEW];
		const currView = this.props.selectedTicket?.properties?.[AdditionalProperties.DEFAULT_VIEW];

		if (!isEqual(prevView, currView) || this.props.treeNodesList !== prevProps.treeNodesList) {
			// This is for not refreshing the view when exiting a selected ticket or when the card is closed
			goToView(currView);
		}
	}

	public componentWillUnmount() {
		const { match: { params } } = this.props;

		MultiSelect.removeKeyWatchers();
		this.props.unsubscribeOnIssueChanges(params.teamspace, params.model);
		this.props.unsubscribeOnRiskChanges(params.teamspace, params.model);
		this.props.stopListenOnSelections();
		this.props.stopListenOnModelLoaded();
		this.props.stopListenOnClickPin();
		this.props.resetPanelsStates();
		this.props.viewer.destroy();
		this.props.resetModel();
		this.props.resetViewerGui();
		this.toggleViewerListeners(false);
		this.props.clearCurrentlySelected();
	}

	private toggleViewerListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		const { viewer } = this.props;

		viewer[resolver](VIEWER_EVENTS.MEASUREMENT_REMOVED, this.handleMeasureRemoved);
	}

	private handleMeasureRemoved = (measurementId) => this.props.removeMeasurement(measurementId);

	public render() {
		const { leftPanels, rightPanels, draggablePanels, isFocusMode, viewer } = this.props;

		return (
			<GuiContainer>
				<CloseFocusModeButton isFocusMode={isFocusMode} />
				<Container id="gui-container" className={this.props.className} hidden={isFocusMode}>
					<RevisionsSwitch />
					<Toolbar />
					{this.renderLeftPanelsButtons()}
					{this.renderLeftPanels(leftPanels)}
					{this.renderRightPanels(rightPanels)}
					{this.renderDraggablePanels(draggablePanels)}
					{this.renderViewerLoader(viewer.hasInstance)}
				</Container>
			</GuiContainer>
		);
	}

	private handleTogglePanel = (panelType) => {
		this.props.setPanelVisibility(panelType);
	}

	private renderLeftPanelsButtons = () => (
		<LeftPanelsButtons>
			{getViewerLeftPanels(this.props.issuesEnabled, this.props.risksEnabled).map(({ name, type }) => (
				<PanelButton
					key={type}
					onClick={this.handleTogglePanel}
					label={name}
					type={type}
					id={type + '-panel-button'}
					active={this.props.leftPanels.includes(type)}
				/>
			))}
		</LeftPanelsButtons>
	)

	private panelsMap = {
		[VIEWER_PANELS.ISSUES]: Issues,
		[VIEWER_PANELS.RISKS]: Risks,
		[VIEWER_PANELS.TICKETS]: Tickets,
		[VIEWER_PANELS.GROUPS]: Groups,
		[VIEWER_PANELS.VIEWS]: Views,
		[VIEWER_PANELS.TREE]: Tree,
		[VIEWER_PANELS.COMPARE]: Compare,
		[VIEWER_PANELS.GIS]: Gis,
		[VIEWER_PANELS.SEQUENCES]: Sequences,
		[VIEWER_PANELS.MEASUREMENTS]: Measurements,
	};

	private renderLeftPanels = (panels) => (
		<LeftPanels>
			{panels.map((panel) => {
				const PanelComponent = this.panelsMap[panel];
				if (panel === AddOn.Issues && !this.props.issuesEnabled || panel === AddOn.Risks && !this.props.risksEnabled) {
					return null;
				}
				return PanelComponent && <PanelComponent key={panel} id={panel + '-card'} {...this.urlParams} />;
			})}
		</LeftPanels>
	)

	private renderRightPanels = (panels) => (
		<RightPanels>
			{panels.includes(VIEWER_PANELS.BIM) && <Bim {...this.urlParams} />}
			{panels.includes(VIEWER_PANELS.ACTIVITIES) && <Activities {...this.urlParams} />}
		</RightPanels>
	)

	private renderDraggablePanels = (panels) => (
		<DraggablePanels>
			{panels.includes(VIEWER_PANELS.LEGEND) && <Legend
				defaultPosition={{
					x: getWindowWidth() - PANEL_DEFAULT_WIDTH - 20,
					y: getWindowHeight() - this.minPanelHeight - 170,
				}}
				height={this.minPanelHeight}
			/>}
		</DraggablePanels>
	)
}
