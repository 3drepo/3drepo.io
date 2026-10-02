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
import { BOARD_ROUTE, BOARD_ROUTE_WITH_MODEL, ViewerParams } from '@/v5/ui/routes/routes.constants';
import { formatMessage } from '@/v5/services/intl';

import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { KanbanBoard, KanbanMoveAcrossLanesEvent } from '@components/kanbanBoard/kanbanBoard.component';
import { ISSUE_FILTERS } from '../../constants/issues';
import { ROUTES, RouteParams } from '../../constants/routes';
import { filtersValuesMap as issuesFilters, getHeaderMenuItems as getIssueMenuItems } from '../../helpers/issues';
import { renderWhenTrue } from '../../helpers/rendering';
import { ISSUE_FILTER_PROPS, ISSUE_FILTER_VALUES } from '../../modules/board/board.constants';
import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';

import { Loader } from '../components/loader/loader.component';
import { MenuButton } from '../components/menuButton/menuButton.component';

import { isViewer } from '../../helpers/permissions';
import { renderActionsMenu } from '../../helpers/reportedItems';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { FilterPanel } from '../components/filterPanel/filterPanel.component';
import { getProjectModels } from './board.helpers';
import {
	AddButton,
	BoardContainer,
	BoardItem,
	Config,
	Container,
	DataConfig,
	FormControl,
	LoaderContainer,
	ModelSelectFormControl,
	NoDataMessage,
	SelectContainer,
	ViewConfig
} from './board.styles';

const types = [{ value: 'issues', name: 'Issues' }];

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
	navigate: (to: string, options?: { replace?: boolean }) => void;
	location: any;
	match: any;
	lanes: ILane[];
	teamspaces: any[];
	isPending: boolean;
	filterProp: string;
	searchEnabled: boolean;
	jobs: any[];
	topicTypes: any[];
	selectedIssueFilters: any[];
	sortOrder: string;
	cards: ICard[];
	projectsMap: any;
	modelsMap: any;
	showClosedIssues: boolean;
	modelSettings: any;
	fetchData: (teamspace, project, modelId) => void;
	fetchCardData: (teamspace, modelId, cardId) => void;
	resetCardData: () => void;
	showDialog: (config: any) => void;
	setFilterProp: (filterProp: string) => void;
	updateIssue: (teamspace, model, issueData: any) => void;
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
	resetModel: () => void;
	resetIssues: () => void;
	openCardDialog: (cardId: string, onChange: (index: number) => void) => void;
	setSortBy: (field) => void;
	// criteria: any;
	issuesEnabled: boolean,
}

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
	const firstUpdate = useRef(true);
	const { teamspace, project: projectId, containerOrFederation } = useParams<ViewerParams & RouteParams>();
	const v5Project = ProjectsHooksSelectors.selectCurrentProjectName();
	const project = v5Project;
	const modelId = containerOrFederation;

	const {
		resetModel,
		resetIssues,
	} = props;

	useEffect(() => {
		props.subscribeOnIssueChanges(teamspace, modelId);
		props.setFilterProp(ISSUE_FILTER_PROPS.status.value);

		return () => {
			props.unsubscribeOnIssueChanges(teamspace, modelId);
			props.setFilters([]);
		};
	}, []);

	useEffect(() => {
		props.fetchData(teamspace, project, modelId);
	}, [teamspace, project, modelId]);

	const removeReactTrelloTooltip = () => {
		const board = boardRef.current;
		const lanes = board.getElementsByClassName('react-trello-lane');

		setTimeout(() => {
			[...lanes].forEach((lane) => lane.removeAttribute('title'));
		});
	};

	useEffect(() => {
		if (boardRef.current) {
			removeReactTrelloTooltip();
		}
	}, [props.cards, props.isPending]);

	useEffect(() => {
		return () => {
			resetModel();
			resetIssues();
		};
	}, []);

	const hasViewerPermissions = isViewer(props.modelSettings.permissions);

	const isDraggable = get(
		ISSUE_FILTER_PROPS,
		[props.filterProp, 'draggable'],
		false
	);

	const teamspacesItems = useMemo(() => props.teamspaces.map(({ account }) => ({ value: account })), [props.teamspaces]);

	const getPath = ({ modelPath = modelId }: any) => {
		const boardPath = modelPath ? BOARD_ROUTE_WITH_MODEL : BOARD_ROUTE;
		return generatePath(boardPath, {
			type: 'issues',
			containerOrFederation: modelPath,
			project: projectId,
			teamspace,
		});
	};

	useEffect(() => {
		if (boardRef.current && !firstUpdate.current) {
			handleModelChange({ target: { value: null } });
		}
		if (firstUpdate.current) {
			firstUpdate.current = false;
		}
	}, [projectId]);

	const handleModelChange = (e) => {
		const newModelId = e.target.value;
		const url = getPath({ modelPath: newModelId });

		props.unsubscribeOnIssueChanges(teamspace, modelId);
		props.subscribeOnIssueChanges(teamspace, newModelId);

		props.navigate(url);
	};

	const handleFilterClick = ({target: {value}}) => {
		if (props.filterProp !== value) {
			props.setFilterProp(value);
		}
	};

	const handleNavigationChange = (newIndex) => {
		const newCardId = props.cards[newIndex].id;
		props.resetCardData();
		props.fetchCardData(teamspace, modelId, newCardId);
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

		return toLaneId;
	};

	const handleCardMove = ({ sourceLaneId, targetLaneId, cardId }: KanbanMoveAcrossLanesEvent) => {
		if (sourceLaneId === targetLaneId) {
			return;
		}

		const updatedProps = {
			[props.filterProp]: getUpdatedProps({ filterProp: props.filterProp, toLaneId: targetLaneId })
		};

		props.updateIssue(teamspace, modelId, { _id: cardId, ...updatedProps });
	};

	const handleCardDrop = () => {
		if (hasViewerPermissions) {
			props.showSnackbar('Insufficient permissions to perform this action');
			return;
		}
		if (!isDraggable) {
			props.showSnackbar('The current property is not draggable');
			return;
		}
		return true;
	};

	const handleSearchClose = () => {
		props.toggleSearchEnabled();
		props.setFilters([]);
	};

	const renderModelsSelect = () => {
		const models = getProjectModels(props.teamspaces, props.projectsMap, props.modelsMap, teamspace, project);
		return (
			<ModelSelectFormControl>
				<InputLabel shrink htmlFor="model-select">
					<FormattedMessage id="board.select.federationOrContainer.label" defaultMessage="Federation / Container" />
				</InputLabel>
				<CellSelect
					placeholder={formatMessage({ id: 'board.select.federationOrContainer.placeholder', defaultMessage: 'Select Federation / Container' })}
					items={models}
					value={models.length ? modelId : ''}
					onChange={handleModelChange}
					disabled={!models.length}
					disabledPlaceholder
					inputId="model-select"
				/>
			</ModelSelectFormControl>
		);
	};

	const renderAddButton = () => (
		<AddButton
			color="secondary"
			aria-label="Add new card"
			aria-haspopup="true"
			onClick={handleAddNewCard}
			disabled={props.isPending || !modelId || !project || hasViewerPermissions}
		>
			<Add />
			{formatMessage({ id: 'board.newIssue.button', defaultMessage: 'New issue' })}
		</AddButton>
	);

	const renderFilters = () => (
		<SelectContainer>
			<FormControl>
				<InputLabel disabled={!containerOrFederation} shrink htmlFor="group-select">Group by</InputLabel>
				<CellSelect
					placeholder="Select grouping type"
					items={ISSUE_FILTER_VALUES}
					value={props.filterProp}
					onChange={handleFilterClick}
					disabled={!ISSUE_FILTER_VALUES.length || !containerOrFederation}
					disabledPlaceholder
					inputId="group-select"
				/>
			</FormControl>
		</SelectContainer>
	);

	const components = {
		Card: IssueBoardCard,
	};

	const renderBoard = renderWhenTrue(() => (
		<BoardContainer>
			<div ref={boardRef}>
				<KanbanBoard
					data={props.lanes}
					handleDragEnd={handleCardDrop}
					onCardClick={handleOpenDialog}
					onCardMoveAcrossLanes={handleCardMove}
					components={components}
				/>
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
			<NoDataMessage>No issues have been created yet.</NoDataMessage>
		</LoaderContainer>
	));

	const renderNoSelected = renderWhenTrue(() => {
		const messagePrefix = 'You have to choose';
		const chooseMessage = formatMessage({ defaultMessage: 'Please select a federation or container to proceed', id: 'board.emptyBoard.placeholder' });
		const areModels =
			getProjectModels(props.teamspaces, props.projectsMap, props.modelsMap, teamspace, project).length > 1;

		return (
			<LoaderContainer>
				<NoDataMessage>
					{(!modelId && areModels) && chooseMessage}
					{(!modelId && !project) && `${messagePrefix} project and model to show board.`}
					{project && !areModels && 'No federation/container found.'}
				</NoDataMessage>
			</LoaderContainer>
		);
	});

	const filterItems = () => {
		const filterValuesMap =  issuesFilters(props.jobs, props.topicTypes)
		const generatedFilters = ISSUE_FILTERS.map((issueFilter) => {
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
	const headerMenu = getIssueMenuItems(menuProps);

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
				selectedFilters={props.selectedIssueFilters}
			/>
		);
	});

	return (
		<Container>
		{renderSearchPanel(props.searchEnabled)}
		<Config>
			<DataConfig>
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
	);
}
