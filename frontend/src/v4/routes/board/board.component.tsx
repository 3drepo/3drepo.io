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

import { useCallback, useEffect, useMemo, useRef } from 'react';

import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Add from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import { get } from 'lodash';
import { useParams, generatePath } from 'react-router-dom';
import TrelloBoard from 'react-trello';
import { isV5 } from '@/v4/helpers/isV5';
import { BOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { formatMessage } from '@/v5/services/intl';
import { ConditionalV5Wrapper } from '@/v5/ui/v4Adapter/conditionalV5Container.component';
import { ScrollArea } from '@controls/scrollArea';

import { ContainersHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ISSUE_FILTERS, ISSUES_ACTIONS_MENU } from '../../constants/issues';
import { RISK_FILTERS } from '../../constants/risks';
import { ROUTES, RouteParams } from '../../constants/routes';
import { filtersValuesMap as issuesFilters, getHeaderMenuItems as getIssueMenuItems } from '../../helpers/issues';
import { renderWhenTrue } from '../../helpers/rendering';
import { filtersValuesMap as risksFilters, getHeaderMenuItems as getRisksMenuItems  } from '../../helpers/risks';
import {
	ISSUE_FILTER_PROPS, ISSUE_FILTER_VALUES, RISK_FILTER_PROPS, RISK_FILTER_VALUES
} from '../../modules/board/board.constants';
import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';

import { Loader } from '../components/loader/loader.component';
import { MenuButton } from '../components/menuButton/menuButton.component';
import { Panel } from '../components/panel/panel.component';

import { isViewer } from '../../helpers/permissions';
import { renderActionsMenu } from '../../helpers/reportedItems';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { FilterPanel } from '../components/filterPanel/filterPanel.component';
import { getProjectModels, getTeamspaceProjects } from './board.helpers';
import {
	AddButton,
	BoardContainer,
	BoardItem,
	Config,
	Container,
	DataConfig,
	FormControl,
	LoaderContainer,
	NoDataMessage,
	SelectContainer,
	ViewConfig
} from './board.styles';
import { BoardTitleComponent } from './components/boardTitleComponent.component';

const types = [{ value: 'issues', name: 'Issues' } , { value: 'risks', name: 'Risks' }];

interface ICard {
	id: string;
	title: string;
	description: string;
	label: string;
	draggable: boolean;
	metadata: any;
}

interface ILane {
	id: string;
	title: string;
	label: string;
	cards: ICard[];
}

interface IProps {
	currentTeamspace: string;
	history: any;
	location: any;
	match: any;
	lanes: ILane[];
	teamspaces: any[];
	isPending: boolean;
	filterProp: string;
	boardType: string;
	searchEnabled: boolean;
	jobs: any[];
	topicTypes: any[];
	selectedIssueFilters: any[];
	selectedRiskFilters: any[];
	sortOrder: string;
	cards: ICard[];
	projectsMap: any;
	modelsMap: any;
	showClosedIssues: boolean;
	modelSettings: any;
	fetchData: (boardType, teamspace, project, modelId) => void;
	fetchCardData: (boardType, teamspace, modelId, cardId) => void;
	resetCardData: () => void;
	showDialog: (config: any) => void;
	setFilterProp: (filterProp: string) => void;
	setBoardType: (boardType: string) => void;
	updateIssue: (teamspace, model, issueData: any) => void;
	updateRisk: (teamspace, model, riskData: any) => void;
	toggleSearchEnabled: () => void;
	setFilters: (filters) => void;
	importBCF: (teamspace, modelId, file, revision) => void;
	exportBCF: (eamspace, modelId) => void;
	printItems: (teamspace, model) => void;
	downloadItems: (teamspace, model) => void;
	toggleSortOrder: () => void;
	toggleClosedIssues: () => void;
	showSnackbar: (text) => void;
	subscribeOnIssueChanges: (teamspace, modelId) => void;
	unsubscribeOnIssueChanges: (teamspace, modelId) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
	resetModel: () => void;
	resetIssues: () => void;
	resetRisks: () => void;
	openCardDialog: (cardId: string, onChange: (index: number) => void) => void;
	setSortBy: (field) => void;
	criteria: any;
}

const PANEL_PROPS = {
	paperProps: {
		height: '100%'
	}
};

const RiskBoardCard = ({ metadata, onClick }: any) => (
	<BoardItem
		key={metadata.id}
		{...metadata}
		onItemClick={onClick}
		panelName="risk "
	/>
);

const IssueBoardCard = ({ metadata, onClick }: any) => (
	<BoardItem
		key={metadata.id}
		{...metadata}
		panelName="issue "
		onItemClick={onClick}
	/>
);

export function Board(props: IProps) {
	const boardRef = useRef(null);
	const { type, teamspace, project: projectId, modelId: v4Model, containerOrFederation } = useParams<RouteParams>();
	const v5Project = ProjectsHooksSelectors.selectCurrentProjectName();
	const project = isV5() ? v5Project : projectId;
	const modelId = isV5() ? containerOrFederation : v4Model;
	const projectParam = `${project ? `/${project}` : ''}`;
	const modelParam = `${modelId ? `/${modelId}` : ''}`;
	const isIssuesBoard = type === 'issues';
	const boardData = { lanes: props.lanes };
	const selectedFilters = isIssuesBoard ? props.selectedIssueFilters : props.selectedRiskFilters;

	const {
		resetModel,
		resetIssues,
		resetRisks,
	} = props;
	useEffect(() => {
		if (type !== props.boardType) {
			props.setBoardType(type);
		}

		if (!isIssuesBoard) {
			props.setFilterProp(RISK_FILTER_PROPS.level_of_risk.value);
			props.subscribeOnRiskChanges(teamspace, modelId);
		} else {
			props.subscribeOnIssueChanges(teamspace, modelId);
			props.setFilterProp(ISSUE_FILTER_PROPS.status.value);
		}

		return () => {
			if (!isIssuesBoard) {
				props.unsubscribeOnRiskChanges(teamspace, modelId);
			} else {
				props.unsubscribeOnIssueChanges(teamspace, modelId);
			}
			props.setFilters([]);
		};
	}, [type]);

	useEffect(() => {
		props.fetchData(type, teamspace, project, modelId);
	}, [type, teamspace, project, modelId]);

	useEffect(() => {
		if (boardRef.current) {
			const board = boardRef.current;
			const lanes = board.getElementsByClassName('react-trello-lane');

			setTimeout(() => {
				[...lanes].forEach((lane) => lane.removeAttribute('title'));
			});
		}
	}, [boardRef, props.isPending]);

	useEffect(() => {
		return () => {
			resetModel();
			resetIssues();
			resetRisks();
		};
	}, []);

	const hasViewerPermissions = isViewer(props.modelSettings.permissions);

	const isDraggable = !hasViewerPermissions && get(
		isIssuesBoard ? ISSUE_FILTER_PROPS : RISK_FILTER_PROPS,
		[props.filterProp, 'draggable'],
		false
	);

	const teamspacesItems = useMemo(() => props.teamspaces.map(({ account }) => ({ value: account })), [props.teamspaces]);

	const getV5Path = ({ typePath = type, modelPath = modelId }: any) => generatePath(BOARD_ROUTE, {
		type: typePath,
		containerOrFederation: modelPath,
		project: projectId,
		teamspace,
	});

	const handleTypeChange = (e) => {
		const url = isV5()
			? getV5Path({ typePath: e.target.value })
			: `${ROUTES.BOARD_MAIN}/${e.target.value}/${teamspace}${projectParam}${modelParam}`;
		props.history.push(url);
		props.setBoardType(e.target.value);
	};

	const handleTeamspaceChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${type}/${e.target.value}`;
		props.history.push(url);
	};

	const handleProjectChange = (e) => {
		const url = isV5()
			? getV5Path({ projectPath: e.target.value })
			: `${ROUTES.BOARD_MAIN}/${type}/${teamspace}/${e.target.value}`;
		props.history.push(url);
	};

	useEffect(() => {
		if (isV5() && boardRef.current) {
			handleModelChange({ target: { value: null } });
		}
	}, [projectId]);

	const handleModelChange = (e) => {
		const newModelId = e.target.value;
		const url = isV5()
			? getV5Path({ modelPath: newModelId })
			: `${ROUTES.BOARD_MAIN}/${type}/${teamspace}/${project}/${newModelId}`;

		if (!isIssuesBoard) {
			props.unsubscribeOnRiskChanges(teamspace, modelId);
			props.subscribeOnRiskChanges(teamspace, newModelId);
		} else {
			props.unsubscribeOnIssueChanges(teamspace, modelId);
			props.subscribeOnIssueChanges(teamspace, newModelId);
		}

		props.history.push(url);
	};

	const handleFilterClick = ({target: {value}}) => {
		if (props.filterProp !== value) {
			props.setFilterProp(value);
		}
	};

	const handleNavigationChange = (newIndex) => {
		const newCardId = props.cards[newIndex].id;
		props.resetCardData();
		props.fetchCardData(type, teamspace, modelId, newCardId);
	};

	const handleOpenDialog = useCallback((cardId?) => {
		props.openCardDialog(cardId, handleNavigationChange);
	}, [teamspace, modelId, props.cards]);

	const handleAddNewCard = () => {
		handleOpenDialog();
	};

	const getUpdatedProps = ({ filterProp, toLaneId }) => {
		if (filterProp === ISSUE_FILTER_PROPS.assigned_roles.value) {
			return [toLaneId];
		}

		if (filterProp === RISK_FILTER_PROPS.mitigation_status.value && filterProp === toLaneId ) {
			return '';
		}

		return toLaneId;
	};

	const handleCardMove = (fromLaneId, toLaneId, cardId) => {
		if (fromLaneId === toLaneId) {
			return;
		}

		const updatedProps = {
			[props.filterProp]: getUpdatedProps({ filterProp: props.filterProp, toLaneId })
		};

		if (isIssuesBoard) {
			props.updateIssue(teamspace, modelId, { _id: cardId, ...updatedProps });
		} else {
			props.updateRisk(teamspace, modelId, { _id: cardId, ...updatedProps });
		}
	};

	const handleCardDrop = () => {
		if (!isDraggable) {
			props.showSnackbar('Insufficient permissions to perform this action');
		}
		return isDraggable;
	};

	const handleSearchClose = () => {
		props.toggleSearchEnabled();
		props.setFilters([]);
	};

	const renderTeamspacesSelect = () => (
		<FormControl>
			<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
			<CellSelect
				placeholder="Select teamspace"
				items={teamspacesItems}
				value={teamspacesItems.length ? teamspace : ''}
				onChange={handleTeamspaceChange}
				disabled={!teamspacesItems.length}
				disabledPlaceholder
				inputId="teamspace-select"
			/>
		</FormControl>
	);

	const renderProjectsSelect = () => {
		const projects = getTeamspaceProjects(props.teamspaces, props.projectsMap, teamspace);
		return (
			<FormControl>
				<InputLabel shrink htmlFor="project-select">Project</InputLabel>
				<CellSelect
					placeholder="Select project"
					items={projects}
					value={projects.length ? project : ''}
					onChange={handleProjectChange}
					disabled={!projects.length}
					disabledPlaceholder
					inputId="project-select"
				/>
			</FormControl>
		);
	};

	const renderModelsSelect = () => {
		const models = getProjectModels(props.teamspaces, props.projectsMap, props.modelsMap, teamspace, project);
		return (
			<FormControl>
				<InputLabel shrink htmlFor="model-select">
					{isV5()
						? formatMessage({ id: 'board.select.federationOrContainer.label', defaultMessage: 'Federation / Container' })
						: 'Model/Federation'
					}
				</InputLabel>
				<CellSelect
					placeholder={isV5()
						? formatMessage({ id: 'board.select.federationOrContainer.placeholder', defaultMessage: 'Select Federation / Container' })
						: 'Select model/federation'
					}
					items={models}
					value={models.length ? modelId : ''}
					onChange={handleModelChange}
					disabled={!models.length}
					disabledPlaceholder
					inputId="model-select"
				/>
			</FormControl>
		);
	};

	const renderAddButton = () => (
		<AddButton
			color="secondary"
			aria-label="Add new card"
			aria-haspopup="true"
			onClick={handleAddNewCard}
			disabled={props.isPending || !modelId || !project}
		>
			<Add />
			{isV5() && isIssuesBoard && formatMessage({ id: 'board.newIssue.button', defaultMessage: 'New issue' })}
			{isV5() && !isIssuesBoard && formatMessage({ id: 'board.newRisk.button', defaultMessage: 'New risk' })}
		</AddButton>
	);

	const FILTER_VALUES = isIssuesBoard ? ISSUE_FILTER_VALUES : RISK_FILTER_VALUES;

	const renderFilters = () => {
		return (
			<>
				<SelectContainer>
					<FormControl>
						<InputLabel disabled={isV5() && !containerOrFederation} shrink htmlFor="type-select">Show</InputLabel>
						<CellSelect
							placeholder="Select type"
							items={types}
							value={type}
							onChange={handleTypeChange}
							disabled={!types.length || (isV5() && !containerOrFederation)}
							disabledPlaceholder
							inputId="type-select"
						/>
					</FormControl>
				</SelectContainer>
				<SelectContainer>
					<FormControl>
						<InputLabel disabled={isV5() && !containerOrFederation} shrink htmlFor="group-select">Group by</InputLabel>
						<CellSelect
							placeholder="Select grouping type"
							items={FILTER_VALUES}
							value={props.filterProp}
							onChange={handleFilterClick}
							disabled={!FILTER_VALUES.length || (isV5() && !containerOrFederation)}
							disabledPlaceholder
							inputId="group-select"
						/>
					</FormControl>
				</SelectContainer>
			</>
		);
	};

	const components = {
		Card:  isIssuesBoard ? IssueBoardCard : RiskBoardCard,
		...(isV5() && { ScrollableLane: ScrollArea }),
	};

	const renderBoard = renderWhenTrue(() => (
		<BoardContainer>
			<div ref={boardRef}>
				<ConditionalV5Wrapper
					v5Wrapper={ScrollArea}
					v5WrapperProps={{ style: { height: '100%' } }}
				>
					<TrelloBoard
						data={boardData}
						hideCardDeleteIcon
						handleDragEnd={handleCardDrop}
						onCardClick={handleOpenDialog}
						onCardMoveAcrossLanes={handleCardMove}
						components={components}
						cardDraggable
					/>
				</ConditionalV5Wrapper>
			</div>
		</BoardContainer>
	));

	const renderLoader = renderWhenTrue(() => (
		<LoaderContainer>
			<Loader size={20} />
		</LoaderContainer>
	));

	const renderNoData = renderWhenTrue(() => (
		<LoaderContainer>
			<NoDataMessage>No {type} have been created yet.</NoDataMessage>
		</LoaderContainer>
	));

	const renderNoSelected = renderWhenTrue(() => {
		const noModelAndProject = !modelId && !project;
		const noModel = !modelId;
		const messagePrefix = 'You have to choose';
		const messageSufix = noModelAndProject ? 'project and model' : noModel ? 'model' : 'project';
		const chooseMessage = isV5()
			? formatMessage({ defaultMessage: `Select the federation or container to show board`, id: 'board.emptyBoard.placeholder' })
			: `${messagePrefix} ${messageSufix} to show board.`;
		const areModels =
			getProjectModels(props.teamspaces, props.projectsMap, props.modelsMap, teamspace, project).length > 1;

		return (
			<LoaderContainer>
				<NoDataMessage>
					{(!modelId && areModels) && chooseMessage}
					{(!modelId && !project) && `${messagePrefix} project and model to show board.`}
					{project && !areModels && `There is no models in ${project} project. Try another one, or add new model.`}
				</NoDataMessage>
			</LoaderContainer>
		);
	});

	const FILTER_ITEMS = isIssuesBoard ? ISSUE_FILTERS : RISK_FILTERS;

	const filterItems = () => {
		const filterValuesMap = isIssuesBoard
				? issuesFilters(props.jobs, props.topicTypes)
				: risksFilters(props.jobs, props.criteria);

		const generatedFilters = FILTER_ITEMS.map((issueFilter) => {
			issueFilter.values = filterValuesMap[issueFilter.relatedField];
			return issueFilter;
		});

		return generatedFilters.filter((filter) => filter.values.length);
	};

	const getSearchButton = () => {
		if (props.searchEnabled) {
			return <IconButton disabled={!project || !modelId} onClick={handleSearchClose} size="large"><CancelIcon /></IconButton>;
		}
		return (
            <IconButton
                disabled={!project || !modelId}
                onClick={props.toggleSearchEnabled}
                size="large"
			>
				<SearchIcon />
			</IconButton>
        );
	};

	const menuProps = {...props, teamspace, model: modelId};
	const headerMenu = isIssuesBoard ? getIssueMenuItems(menuProps) : getRisksMenuItems(menuProps);

	const getMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={() => renderActionsMenu(headerMenu)}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled: !project || !modelId }}
		/>
	);

	const renderActions = () => {
		return (
			<>
				{getSearchButton()}
				{getMenuButton()}
			</>
		);
	};

	const renderSearchPanel = renderWhenTrue(() => {
		const filters = filterItems();

		return (
			<FilterPanel
				onChange={props.setFilters}
				filters={filters}
				selectedFilters={selectedFilters}
			/>
		);
	});

	const BoardTitle = (<BoardTitleComponent renderActions={renderActions} />);

	return (
		<Panel {...PANEL_PROPS} title={BoardTitle}>
			<Container>
				{renderSearchPanel(props.searchEnabled)}
				<Config>
					<DataConfig>
						{renderTeamspacesSelect()}
						{renderProjectsSelect()}
						{renderModelsSelect()}
					</DataConfig>
					<ViewConfig>
						{renderFilters()}
						{renderAddButton()}
					</ViewConfig>
				</Config>
				{renderLoader(props.isPending)}
				{renderBoard(!props.isPending && Boolean(props.lanes.length) && modelId && project)}
				{renderNoData(!props.isPending && !Boolean(props.lanes.length) && teamspace && project && modelId)}
				{renderNoSelected(!props.isPending && (!Boolean(props.lanes.length) || (!project || !modelId)))}
			</Container>
		</Panel>
	);
}
