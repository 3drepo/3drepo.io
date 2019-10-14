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
import React from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import Board from 'react-trello';
import { ROUTES } from '../../constants/routes';
import { Panel } from '../components/panel/panel.component';
import {
	BoardContainer,
	Config,
	Container,
	SelectContainer,
	StyledItem,
	StyledSelect,
	TitleActions,
	TitleContainer
} from './board.styles';
interface IProps {
	history: any;
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

	const handleChangeType = (e) => {
		const projectParam = `${project ? `/${project}` : ''}`;
		const modelParam = `${modelId ? `/${modelId}` : ''}`;
		const url = `${ROUTES.BOARD_MAIN}/${e.target.value}/${teamspace}${projectParam}${modelParam}`;
		props.history.push(url);
	};

	const BoardTitle = (
		<TitleContainer>
			<SelectContainer>
				<StyledSelect value={type} onChange={handleChangeType}>
					{types.map((t) => (<StyledItem key={t} value={t}>Project {`${capitalize(t)}`}</StyledItem>))}
				</StyledSelect>
			</SelectContainer>
			<TitleActions>
				<div>Search</div>
				<div>Menu</div>
			</TitleActions>
		</TitleContainer>
	);

	return (
		<Panel {...PANEL_PROPS} title={BoardTitle}>
			<Container>
				<Config>
					<div>Type: {type}</div>
					<div>Teamspace: {teamspace}</div>
					<div>Project: {project}</div>
					<div>Model: {modelId}</div>
				</Config>
				<BoardContainer>
					<Board data={data} />
				</BoardContainer>
			</Container>
		</Panel>
	);
}
