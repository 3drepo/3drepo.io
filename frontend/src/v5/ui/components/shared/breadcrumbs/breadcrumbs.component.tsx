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

import React from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useParams, useRouteMatch } from 'react-router-dom';
import { uriCombine } from '@/v5/services/routing/routing';
import { Container, Breadcrumb, InteractiveBreadcrumb } from './breadcrumbs.styles';
import { NavigationMenu } from '../navigatonMenu';

const teamspacesList = [{
	to: 'atkins',
	title: 'Atkins',
}, {
	to: 'skanska',
	title: 'Skanska',
}];

const projectsLists = {
	atkins: [{
		to: '12389jkh',
		title: 'Dubai',
	}, {
		to: 'nlgkgouo12',
		title: 'Another atkins project',
	}],
	skanska: [
		{
			to: 'kjbljbasda',
			title: 'Kings cross',
		},
		{
			to: 'asdasdjnlkn',
			title: 'Paddington',
		},
	],
};

const addUrlToTarget = (url) => ({ to, title }) => ({ title, to: `${url}/${to}` });

export const Breadcrumbs = (): JSX.Element => {
	const { teamspace, project } = useParams();
	let { url } = useRouteMatch();

	const urlProject = project ? uriCombine(url, '../') : url;

	url = teamspace ? uriCombine(url, '../') : url;
	url = project ? uriCombine(url, '../') : url;

	const getBreadcrumbs = [];

	const teamspaceTo = `${url}/${teamspace}`;

	let list: any[] = !project ? teamspacesList : projectsLists[teamspace] || [];

	if (teamspace) {
		getBreadcrumbs.push(teamspace);
	}

	if (project) {
		getBreadcrumbs.push(list.find(({ to }) => to === project).title);
	}

	list = list.map(addUrlToTarget(urlProject));

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	return (
		<Container aria-label="breadcrumb">
			{getBreadcrumbs.map((title, index) => {
				const isLastItem = (getBreadcrumbs.length - 1) === index;

				if (isLastItem) {
					return (
						<div>
							<InteractiveBreadcrumb onClick={handleClick} endIcon={<ExpandMoreIcon />}>
								{title}
							</InteractiveBreadcrumb>
							<NavigationMenu list={list} anchorEl={anchorEl} handleClose={handleClose} />
						</div>
					);
				}

				return (
					<Breadcrumb color="inherit" to={teamspaceTo}>
						{title}
					</Breadcrumb>
				);
			})}
		</Container>
	);
};
