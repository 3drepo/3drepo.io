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

import * as React from 'react';
import { isEqual, isEmpty } from 'lodash';

import { Panel } from '../components/panel/panel.component';
import { TreeList } from '../components/treeList/treeList.component';
import { Container } from './teamspaces.styles';

const PANEL_PROPS = {
	title: 'Teamspaces',
	paperProps: {
		height: '100%'
	}
};

interface IProps {
	currentTeamspace: string;
	teamspaces: any[];
	isPending: boolean;
}

export const TreeListItem = (props) => {
	return <div>{props.name}</div>;
};

export class Teamspaces extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		teamspaces: []
	};

	public componentDidUpdate(prevProps, prevState) {
		const changes = {};
		const teamspacesChanged = !isEqual(this.props.teamspaces, prevProps.teamspaces);

/* 		if (teamspacesChanged) {
			changes.
		} */

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderFederation = (props) => {
		<div>federation</div>
	}

	public renderModel = (props) => {
		return (
			<TreeList
				key={props.key}
				name={props.name}
				items={[]}
				renderRoot={() => (<TreeListItem name={props.name} />)}
				renderItem={this.renderModel}
			/>
		);
	}

	public renderProject = (props) => {
		const items = [{
			name: 'Federations',
			items: props.fedModels
		}, {
			name: 'Models',
			items: props.models
		}];

		return (
			<TreeList
				key={props.key}
				name={props.name}
				items={[]/*  items */}
				renderRoot={() => (<TreeListItem name={`project: ${props.name}`} />)}
				renderItem={this.renderModel}
			/>
		);
	}

	public renderTeamspaces = (teamspaces) => {
		return teamspaces.map((teamspace, index) => {
			return (
				<TreeList
					key={index}
					items={teamspace.projects}
					renderRoot={() => (<TreeListItem name={`teamspace: ${teamspace.account}`} />)}
					renderItem={this.renderProject}
				/>
			);
		});
	}

	public render() {
		return (
			<Panel {...PANEL_PROPS}>
				{this.renderTeamspaces(this.props.teamspaces)}
			</Panel>
		);
	}
}
