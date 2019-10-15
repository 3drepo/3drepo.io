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
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import IssueDetails from '../viewerGui/components/issues/components/issueDetails/issueDetails.container';
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
	ViewConfig
} from './board.styles';
import { BoardTitleComponent } from './components/boardTitleComponent.component';
import { ConfigSelectComponent } from './components/configSelect.component';

interface IProps {
	currentTeamspace: string;
	history: any;
	location: any;
	match: any;
	teamspaces: any[];
	fetchData: (type, teamspace, project, modelId) => void;
	fetchTeamspaces: (currentTeamspace) => void;
	showDialog: (config: any) => void;
}

const PANEL_PROPS = {
	paperProps: {
		height: '100%'
	}
};

const data = {
	lanes: [
		{
			id: 'lane1',
			title: 'High Priority',
			label: '2 issues',
			cards: [],
		},
		{
			id: 'lane2',
			title: 'Medium Priority',
			label: '0 issues',
			cards: []
		},
		{
			id: 'lane3',
			title: 'Low Priority',
			label: '0 issues',
			cards: []
		}
	]
};

export function Board(props: IProps) {
	const { type, teamspace, project, modelId } = useParams();
	const projectParam = `${project ? `/${project}` : ''}`;
	const modelParam = `${modelId ? `/${modelId}` : ''}`;
	const isIssuesBoard = type === 'issues';

	useEffect(() => {
		console.log('useEffect', type, teamspace, project, modelId);

		props.fetchData(type, teamspace, project, modelId);
	}, [type, teamspace, project, modelId]);

	console.log('props.teamspaces', props.teamspaces);

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

	const handleOpenDialog = useCallback(() => {
		const dataType = isIssuesBoard ? 'issue' : 'risk';
		const TemplateComponent = isIssuesBoard ? IssueDetails : RiskDetails;
		const Form = (formProps: any) => (
			<FormWrapper size="sm">
				<TemplateComponent {...formProps} />
			</FormWrapper>
		);
		const config = {
			title: `Add new ${dataType}`,
			template: Form,
			data: {
				teamspace: 'demo_3DRepo',
				model: 'b9aca152-61a5-4e00-953d-d88339e44fef', // modelId,
				disableViewer: true,
				horizontal: true
			},
			DialogProps: {
				maxWidth: 'sm'
			}
		};

		props.showDialog(config);
	}, [type]);

	const renderTeamspacesSelect = () => (
		<ConfigSelect value={teamspace} onChange={handleTeamspaceChange} disabled={!props.teamspaces.length}>
			{ props.teamspaces.length ?
				props.teamspaces.map((ts, index) => (
					<ConfigSelectItem key={index} value={ts.account}>
						{ts.account}
					</ConfigSelectItem>
				)) : <ConfigSelectItem value={teamspace}>{teamspace}</ConfigSelectItem>
			}
		</ConfigSelect>
	);

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
			onClick={handleOpenDialog}
		>
			<Add />
		</AddButton>
	);

	const BoardTitle = (<BoardTitleComponent type={type} handleTypeChange={handleTypeChange} />);

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
				<BoardContainer>
					<TrelloBoard
						data={data}
						laneDraggable="false"
						hideCardDeleteIcon
						onCardClick={handleOpenDialog}
					/>
				</BoardContainer>
			</Container>;
		</Panel >
	);
}
