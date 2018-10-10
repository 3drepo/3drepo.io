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
import { isEqual, isEmpty, groupBy } from 'lodash';

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
		return <div key={props.key}>{props.name}</div>;
	}

	public renderModel = (props) => {
		return <div key={props.key}>{props.name}</div>;
	}

	public renderProjectItem = (props) => {
		return (
			<TreeList
				key={props.key}
				name={props.name}
				level={3}
				items={props.items}
				renderItem={this.renderModel}
			/>
		);
	}

	public renderProject = (props) => {
		const {federations = [], models } = groupBy(props.models, ({federate}) => {
			return federate ? 'federations' : 'models';
		});
		const items = [{
			name: 'Federations',
			items: federations
		}, {
			name: 'Models',
			items: models
		}];

		return (
			<TreeList
				key={props.key}
				name={props.name}
				level={2}
				items={items}
				renderItem={this.renderProjectItem}
			/>
		);
	}

	public renderTeamspaces = (teamspaces) => {
		return teamspaces.map((teamspace, index) => {
			return (
				<TreeList
					key={index}
					name={teamspace.account}
					level={1}
					items={teamspace.projects}
					renderItem={this.renderProject}
				/>
			);
		});
	}

	public render() {
		return (
			<Panel {...PANEL_PROPS}>
				<Container>
					{this.renderTeamspaces(this.props.teamspaces)}
				</Container>
			</Panel>
		);
	}
}
