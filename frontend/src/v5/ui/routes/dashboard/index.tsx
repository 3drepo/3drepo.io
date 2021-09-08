/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { discardSlash, discardUrlComponent, RouteExcept, uriCombine } from '@/v5/services/routing/routing';
import { MenuItem, Select } from '@material-ui/core';
import React from 'react';
import { useRouteMatch, useParams, useHistory, Route, Link } from 'react-router-dom';
import { ProjectContent } from './projects';
import { TeamspaceContent } from './teamspaces';

const ProjectsSelection = () => {
	const history = useHistory();
	const { teamspace, project } = useParams();
	let { url } = useRouteMatch();

	url = project ? uriCombine(url, '../') : url;

	const handleChange = (event) => {
		history.push(`${url}/${event.target.value}`);
	};

	const items = {
		atkins: [{
			value: '12389jkh',
			label: 'Dubai',
		}, {
			value: 'nlgkgouo12',
			label: 'Another atkins project',
		}],
		skanska: [
			{
				value: 'kjbljbasda',
				label: 'Kings cross',
			},
			{
				value: 'asdasdjnlkn',
				label: 'Paddington',
			},
		],
	}[teamspace] || [];

	return (
		<Select value={project || '-'} onChange={handleChange} displayEmpty={!project}>
			{items.map(({ value, label }) => (
				<MenuItem key={value} value={value}>{label}</MenuItem>
			))}
		</Select>
	);
};

const NavigationLinks = () => {
	let { url } = useRouteMatch();
	url = discardSlash(url);

	const { project } = useParams();

	return (
		<>
			<br />{url}<br />
			{project && project !== 'settings'
				&& (
					<>
						<Link to={`${url}/federations`}> federations</Link>
						<Link to={`${url}/containers`}> containers</Link>
					</>
				)}
			<Link to={`${discardUrlComponent(url, 'settings')}/settings`}> settings</Link>
		</>
	);
};

const TeamSpacesSelection = () => {
	const history = useHistory();
	const { teamspace, project } = useParams();
	let { url } = useRouteMatch();
	url = uriCombine(url, './');
	url = teamspace ? uriCombine(url, '../') : url;
	url = project ? uriCombine(url, '../') : url;

	const handleChange = (event) => {
		history.push(`${url}/${event.target.value}`);
	};

	return (
		<Select value={teamspace} onChange={handleChange}>
			<MenuItem value="atkins">Atkins</MenuItem>
			<MenuItem value="skanska">Skanska</MenuItem>
		</Select>
	);
};

export const Dashboard = () => {
	const { path } = useRouteMatch();

	return (
		<Route path={`${path}/:teamspace?/:project?`}>
			<h1>logo</h1>
			<TeamSpacesSelection />
			<ProjectsSelection />
			<NavigationLinks />
			<br />

			<Route path={`${path}/:teamspace/`}>
				<TeamspaceContent />
			</Route>

			<RouteExcept path={`${path}/:teamspace/:project`} exceptPath={`${path}/:teamspace/settings`}>
				<ProjectContent />
			</RouteExcept>
		</Route>
	);
};
