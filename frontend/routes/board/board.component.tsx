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

import Add from '@material-ui/icons/Add';
import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TrelloBoard from 'react-trello';

import { ROUTES } from '../../constants/routes';
import { renderWhenTrue } from '../../helpers/rendering';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import IssueDetails from '../viewerGui/components/issues/components/issueDetails/issueDetails.container';
import { PreviewListItem } from '../viewerGui/components/previewListItem/previewListItem.component';
import RiskDetails from '../viewerGui/components/risks/components/riskDetails/riskDetails.container';
import { getProjectModels, getTeamspaceProjects } from './board.helpers';
import {
	AddButton,
	BoardContainer,
	Config,
	ConfigSelect,
	ConfigSelectItem,
	Container,
	DataConfig,
	FormWrapper,
	LoaderContainer,
	NoDataMessage,
	ViewConfig
} from './board.styles';
import { BoardTitleComponent } from './components/boardTitleComponent.component';
import { ConfigSelectComponent } from './components/configSelect.component';

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
	fetchData: (boardType, teamspace, project, modelId) => void;
	fetchCardData: (boardType, teamspace, modelId, cardId) => void;
	showDialog: (config: any) => void;
}

const PANEL_PROPS = {
	paperProps: {
		height: '100%'
	}
};

export function Board(props: IProps) {
	const { type, teamspace, project, modelId } = useParams();
	const projectParam = `${project ? `/${project}` : ''}`;
	const modelParam = `${modelId ? `/${modelId}` : ''}`;
	const isIssuesBoard = type === 'issues';
	const boardData = {
		lanes: props.lanes
	};

	useEffect(() => {
		props.fetchData(type, teamspace, project, modelId);
	}, [type, teamspace, project, modelId]);

	const handleTypeChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${e.target.value}/${teamspace}${projectParam}${modelParam}`;
		props.history.push(url);
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

	const handleOpenDialog = useCallback((cardId?, metadata?, laneId?) => {
		if (cardId) {
			props.fetchCardData(type, teamspace, modelId, cardId);
		}

		const TemplateComponent = isIssuesBoard ? IssueDetails : RiskDetails;
		const dataType = isIssuesBoard ? 'issue' : 'risk';
		const size = cardId && metadata.commentCount ? 'lg' : 'sm';
		const titlePrefix = cardId ? 'Edit' : 'Add new';

		const Form = (formProps: any) => (
			<FormWrapper size={size}>
				<TemplateComponent {...formProps} />
			</FormWrapper>
		);
		const config = {
			title: `${titlePrefix} ${dataType}`,
			template: Form,
			data: {
				teamspace,
				model: modelId,
				disableViewer: true,
				horizontal: true
			},
			DialogProps: {
				maxWidth: size
			}
		};

		props.showDialog(config);
	}, [type, props.fetchCardData]);

	const renderTeamspacesSelect = () => {
		return (
			<ConfigSelect value={teamspace} onChange={handleTeamspaceChange} disabled={!props.teamspaces.length}>
				{ props.teamspaces.length ?
					props.teamspaces.map((ts, index) => (
						<ConfigSelectItem key={index} value={ts.account}>
							{ts.account}
						</ConfigSelectItem>
					)) : <ConfigSelectItem value={teamspace}>{teamspace}</ConfigSelectItem>
				}
			</ConfigSelect>
		)
	};

	const renderProjectsSelect = () => {
		const projects = getTeamspaceProjects(props.teamspaces, teamspace);
		return (<ConfigSelectComponent value={project} items={projects} handleChange={handleProjectChange} />);
	};

	const renderModelsSelect = () => {
		const models = getProjectModels(props.teamspaces, teamspace, project);
		return (<ConfigSelectComponent value={modelId} items={models} handleChange={handleModelChange} />);
	};

	const renderAddButton = () => (
		<AddButton
			variant="fab"
			color="secondary"
			aria-label="Add new card"
			aria-haspopup="true"
			onClick={() => handleOpenDialog()}
		>
			<Add />
		</AddButton>
	);

	const BoardTitle = (<BoardTitleComponent type={type} handleTypeChange={handleTypeChange} />);

	const BoardCard = (cardProps: any) => {
		return (
			<PreviewListItem {...cardProps.metadata} onItemClick={cardProps.onClick} />
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
				onCardClick={handleOpenDialog}
				components={components}
			/>
		</BoardContainer>
	));

	const renderLoader = renderWhenTrue(() => (
		<LoaderContainer>
			<Loader size={18} />
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
		const areModels = getProjectModels(props.teamspaces, teamspace, project).length > 1;

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

	return (
		<Panel {...PANEL_PROPS} title={BoardTitle}>
			<Container>
				<Config>
					<DataConfig>
						{renderTeamspacesSelect()}
						{renderProjectsSelect()}
						{renderModelsSelect()}
					</DataConfig>
					<ViewConfig>
						{renderAddButton()}
					</ViewConfig>
				</Config>
				{renderLoader(props.isPending)}
				{renderBoard(!props.isPending && Boolean(props.lanes.length))}
				{renderNoData(!props.isPending && !Boolean(props.lanes.length) && teamspace && project && modelId)}
				{renderNoSelected(!props.isPending && !Boolean(props.lanes.length) && (!project || !modelId))}
			</Container>
		</Panel>
	);
}
