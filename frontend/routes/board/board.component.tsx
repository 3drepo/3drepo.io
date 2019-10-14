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

import { capitalize } from 'lodash';
import React, { useEffect } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import Board from 'react-trello';
import { ROUTES } from '../../constants/routes';
import { Panel } from '../components/panel/panel.component';
import {
	BoardContainer,
	Config,
	ConfigSelect,
	ConfigSelectItem,
	Container,
	SelectContainer,
	TitleActions,
	TitleContainer,
	TypesItem,
	TypesSelect
} from './board.styles';

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

const types = ['issues', 'risks'];

export function Board(props: IProps) {
	const { type, teamspace, project, modelId } = useParams();
	const match = useRouteMatch();
	const projectParam = `${project ? `/${project}` : ''}`;
	const modelParam = `${modelId ? `/${modelId}` : ''}`;

	useEffect(() => {
		props.fetchTeamspaces(props.currentTeamspace);
	}, [teamspace]);

	const handleTypeChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${e.target.value}/${teamspace}${projectParam}${modelParam}`;
		props.history.push(url);
	};

	const handleTeamspaceChange = (e) => {
		const url = `${ROUTES.BOARD_MAIN}/${type}/${e.target.value}${projectParam}${modelParam}`;
		props.history.push(url);
	};

	const BoardTitle = (
		<TitleContainer>
			<SelectContainer>
				<TypesSelect value={type} onChange={handleTypeChange}>
					{types.map((t) => (<TypesItem key={t} value={t}>Project {`${capitalize(t)}`}</TypesItem>))}
				</TypesSelect>
			</SelectContainer>
			<TitleActions>
				<div>Search</div>
				<div>Menu</div>
			</TitleActions>
		</TitleContainer>
	);

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

	return (
		<Panel {...PANEL_PROPS} title={BoardTitle}>
			<Container>
				<Config>
					{renderTeamspacesSelect()}
				</Config>
				<BoardContainer>
					<Board data={data} />
				</BoardContainer>
			</Container>
		</Panel>
	);
}
