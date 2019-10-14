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

import React from 'react';
import { useParams } from 'react-router-dom';
import Board from 'react-trello';
import { Panel } from '../components/panel/panel.component';
import { Container } from './board.styles';
interface IProps {
}

const PANEL_PROPS = {
	title: 'Board',
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
				{id: 'Card2', title: 'Pay Rent', description: 'Transfer via NEFT', label: '5 mins', metadata: {sha: 'be312a1'}, draggable: true}
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

	return (
		<Panel {...PANEL_PROPS}>
			<Container>
				<div>Type: {type}</div>
				<div>Teamspace: {teamspace}</div>
				<div>Project: {project}</div>
				<div>Model: {modelId}</div>

				<Board data={data} />
			</Container>
		</Panel>
	);
}
