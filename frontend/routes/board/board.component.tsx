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

import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import Add from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import Check from '@material-ui/icons/Check';
import SearchIcon from '@material-ui/icons/Search';
import { get } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TrelloBoard from 'react-trello';

import { ISSUE_FILTERS, ISSUES_ACTIONS_MENU } from '../../constants/issues';
import { RISK_FILTERS } from '../../constants/risks';
import { ROUTES } from '../../constants/routes';
import { filtersValuesMap as issuesFilters, getHeaderMenuItems as getIssueMenuItems } from '../../helpers/issues';
import { renderWhenTrue } from '../../helpers/rendering';
import { filtersValuesMap as risksFilters, getHeaderMenuItems as getRisksMenuItems  } from '../../helpers/risks';
import {
	ISSUE_FILTER_PROPS, ISSUE_FILTER_VALUES, RISK_FILTER_PROPS, RISK_FILTER_VALUES
} from '../../modules/board/board.constants';
import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import {
	IconWrapper, MenuList, StyledItemText, StyledListItem
} from '../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { Loader } from '../components/loader/loader.component';
import { MenuButton } from '../components/menuButton/menuButton.component';
import { Panel } from '../components/panel/panel.component';

import { isViewer } from '../../helpers/permissions';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { FilterPanel } from '../components/filterPanel/filterPanel.component';
import IssueDetails from '../viewerGui/components/issues/components/issueDetails/issueDetails.container';
import { ListNavigation } from '../viewerGui/components/listNavigation/listNavigation.component';
import RiskDetails from '../viewerGui/components/risks/components/riskDetails/riskDetails.container';
import { getProjectModels, getTeamspaceProjects } from './board.helpers';
import {
	AddButton,
	BoardContainer,
	BoardDialogTitle,
	BoardItem,
	Config,
	Container,
	DataConfig,
	FormControl,
	FormWrapper,
	LoaderContainer,
	NoDataMessage,
	SelectContainer,
	Title,
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
	issuesSortOrder: string;
	risksSortOrder: string;
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
	toggleIssuesSortOrder: () => void;
	toggleRisksSortOrder: () => void;
	toggleClosedIssues: () => void;
	showSnackbar: (text) => void;
	subscribeOnIssueChanges: (teamspace, modelId) => void;
	unsubscribeOnIssueChanges: (teamspace, modelId) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
}

const PANEL_PROPS = {
	paperProps: {
		height: '100%'
	}
};

const BoardCard = memo(({ metadata, onClick }: any) => (
	<BoardItem
		key={metadata.id}
		{...metadata}
		onItemClick={onClick}
	/>
));

export function Board(props: IProps) {
	const { type, teamspace, project, modelId } = useParams();
	const projectParam = `${project ? `/${project}` : ''}`;
	const modelParam = `${modelId ? `/${modelId}` : ''}`;
	const isIssuesBoard = type === 'issues';
	const boardData = { lanes: props.lanes };
	const selectedFilters = isIssuesBoard ? props.selectedIssueFilters : props.selectedRiskFilters;
	const {
		printItems,
		downloadItems,
		importBCF,
		exportBCF,
		toggleIssuesSortOrder,
		toggleRisksSortOrder,
		toggleClosedIssues,
		showClosedIssues
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

	const hasViewerPermissions = isViewer(props.modelSettings.permissions);

	const isDraggable = !hasViewerPermissions && get(
		isIssuesBoard ? ISSUE_FILTER_PROPS : RISK_FILTER_PROPS,
		[props.filterProp, 'draggable'],
		false
	);

	const teamspacesItems = useMemo(() => props.teamspaces.map(({ account }) => ({ value: account })), [props.teamspaces]);

	const handleTypeChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${e.target.value}/${teamspace}${projectParam}${modelParam}`;
		props.history.push(url);
		props.setBoardType(e.target.value);
	};

	const handleTeamspaceChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${type}/${e.target.value}`;
		props.history.push(url);
	};

	const handleProjectChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${type}/${teamspace}/${e.target.value}`;
		props.history.push(url);
	};

	const handleModelChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${type}/${teamspace}/${project}/${e.target.value}`;
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

	const handleOpenDialog = useCallback((cardId?, metadata?, laneId?) => {
		if (cardId) {
			props.fetchCardData(type, teamspace, modelId, cardId);
		}

		const TemplateComponent = isIssuesBoard ? IssueDetails : RiskDetails;
		const dataType = isIssuesBoard ? 'issue' : 'risk';
		const size = cardId ? 'lg' : 'sm';
		const titlePrefix = cardId ? 'Edit' : 'Add new';
		const initialIndex = props.cards.findIndex((card) => card.id === cardId);

		if (!cardId) {
			props.resetCardData();
		}

		const Form = (formProps: any) => (
			<FormWrapper size={size}>
				<TemplateComponent {...formProps} disableViewer />
			</FormWrapper>
		);

		const DialogTitle = cardId ? (
			<BoardDialogTitle>
				<Title>{titlePrefix} {dataType}</Title>
				<ListNavigation
					initialIndex={initialIndex}
					lastIndex={props.cards.length - 1}
					onChange={handleNavigationChange}
				/>
			</BoardDialogTitle>
		) : `${titlePrefix} ${dataType}`;

		const config = {
			title: DialogTitle,
			template: Form,
			data: {
				teamspace,
				model: modelId,
				disableViewer: true,
				horizontal: true,
			},
			DialogProps: {
				maxWidth: size
			}
		};

		props.showDialog(config);
	}, [type, props.fetchCardData, project, teamspace, modelId, props.cards]);

	const handleAddNewCard = () => {
		handleOpenDialog();
	};

	const handleCardMove = (fromLaneId, toLaneId, cardId) => {
		if (fromLaneId === toLaneId) {
			return;
		}

		const updatedProps = {
			[props.filterProp]: props.filterProp === ISSUE_FILTER_PROPS.assigned_roles.value ? [toLaneId] : toLaneId
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
				<InputLabel shrink htmlFor="model-select">Model/Federation</InputLabel>
				<CellSelect
					placeholder="Select model/federation"
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
			variant="fab"
			color="secondary"
			aria-label="Add new card"
			aria-haspopup="true"
			onClick={handleAddNewCard}
		>
			<Add />
		</AddButton>
	);

	const FILTER_VALUES = isIssuesBoard ? ISSUE_FILTER_VALUES : RISK_FILTER_VALUES;

	const renderFilters = () => {
		return (
			<>
				<SelectContainer>
					<FormControl>
						<InputLabel shrink htmlFor="type-select">Show</InputLabel>
						<CellSelect
							placeholder="Select type"
							items={types}
							value={type}
							onChange={handleTypeChange}
							disabled={!types.length}
							disabledPlaceholder
							inputId="type-select"
						/>
					</FormControl>
				</SelectContainer>
				<SelectContainer>
					<FormControl>
						<InputLabel shrink htmlFor="group-select">Group by</InputLabel>
						<CellSelect
							placeholder="Select grouping type"
							items={FILTER_VALUES}
							value={props.filterProp}
							onChange={handleFilterClick}
							disabled={!FILTER_VALUES.length}
							disabledPlaceholder
							inputId="group-select"
						/>
					</FormControl>
				</SelectContainer>
			</>
		);
	};

	const components = {
		Card: BoardCard
	};

	const renderBoard = renderWhenTrue(() => (
		<BoardContainer>
			<TrelloBoard
				data={boardData}
				hideCardDeleteIcon
				handleDragEnd={handleCardDrop}
				onCardClick={handleOpenDialog}
				onCardMoveAcrossLanes={handleCardMove}
				components={components}
				cardDraggable
			/>
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
		const chooseMessage = `${messagePrefix} ${messageSufix} to show board.`;
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
		const filterValuesMap = isIssuesBoard ? issuesFilters(props.jobs, props.topicTypes) : risksFilters(props.jobs);

		return FILTER_ITEMS.map((issueFilter) => {
			issueFilter.values = filterValuesMap[issueFilter.relatedField];
			return issueFilter;
		});
	};

	const getSearchButton = () => {
		if (props.searchEnabled) {
			return <IconButton disabled={!project || !modelId} onClick={handleSearchClose}><CancelIcon /></IconButton>;
		}
		return <IconButton disabled={!project || !modelId} onClick={props.toggleSearchEnabled}><SearchIcon /></IconButton>;
	};

	const headerMenu = isIssuesBoard ?
		getIssueMenuItems(
			teamspace,
			modelId,
			null,
			printItems,
			downloadItems,
			importBCF,
			exportBCF,
			toggleIssuesSortOrder,
			null, null,
			toggleClosedIssues,
			showClosedIssues
		) :
		getRisksMenuItems(
			teamspace, modelId, printItems, downloadItems, toggleRisksSortOrder
		);

	const sortOrder = isIssuesBoard ? props.issuesSortOrder : props.risksSortOrder;

	const renderSortIcon = (Icon) => {
		if (sortOrder === 'asc') {
			return <Icon.ASC IconProps={{ fontSize: 'small' }} />;
		}
		return <Icon.DESC IconProps={{ fontSize: 'small' }} />;
	};

	const renderCheckIcon = renderWhenTrue(() => <Check fontSize="small" />);

	const renderActionsMenu = () => (
		<MenuList>
			{(headerMenu as any).map(({ label, Icon, onClick, isSorting }, index) => {
				return (
					<StyledListItem key={index} button onClick={onClick}>
						<IconWrapper>
							{isSorting ? renderSortIcon(Icon) : <Icon fontSize="small" />}
						</IconWrapper>
						<StyledItemText>
							{label}
							{renderCheckIcon(label === ISSUES_ACTIONS_MENU.SHOW_CLOSED_ISSUES.label && props.showClosedIssues)}
						</StyledItemText>
					</StyledListItem>
				);
			})}
		</MenuList>
	);

	const getMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={renderActionsMenu}
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
