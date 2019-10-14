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

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Board from 'react-trello';
import { ROUTES } from '../../constants/routes';
import { Panel } from '../components/panel/panel.component';
import { getProjectModels, getTeamspaceProjects } from './board.helpers';
import {
	BoardContainer,
	Config,
	ConfigSelect,
	ConfigSelectItem,
	Container
} from './board.styles';
import { BoardTitleComponent } from './components/boardTitleComponent.component';
import { ConfigSelectComponent } from './components/configSelect.component';

interface IProps {
	currentTeamspace: string;
	history: any;
	location: any;
	match: any;
	teamspaces: any[];
	fetchTeamspaces: (currentTeamspace) => void;
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
			title: 'Planned Tasks',
			label: '2/2',
			cards: [
				{id: 'Card1', title: 'Write Blog', description: 'Can AI make memes', label: '30 mins', draggable: false},
				{id: 'Card2', title: 'Pay Rent', description: 'Transfer via NEFT', label: '5 mins', metadata: {sha: 'be312a1'}}
			],
		},
		{
			id: 'lane2',
			title: 'Completed',
			label: '0/0',
			cards: []
		}
	]
};

export function Board(props: IProps) {
	const { type, teamspace, project, modelId } = useParams();
	const projectParam = `${project ? `/${project}` : ''}`;
	const modelParam = `${modelId ? `/${modelId}` : ''}`;

	useEffect(() => {
		if (!props.teamspaces.length) {
			props.fetchTeamspaces(props.currentTeamspace);
		}

		if (teamspace && project && modelId) {
			console.log(teamspace, project, modelId, 'Fetch ', type);
		}
	}, [teamspace, project, modelId]);

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

	const BoardTitle = (<BoardTitleComponent type={type} handleTypeChange={handleTypeChange} />);

	return (
		<Panel {...PANEL_PROPS} title={BoardTitle}>
			<Container>
				<Config>
					{renderTeamspacesSelect()}
					{renderProjectsSelect()}
					{renderModelsSelect()}
				</Config>
				<BoardContainer>
					<Board data={data} />
				</BoardContainer>
			</Container>
		</Panel>
	);
}
