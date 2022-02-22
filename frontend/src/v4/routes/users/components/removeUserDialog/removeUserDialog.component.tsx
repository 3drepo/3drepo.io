/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { Headline } from './removeUserDialog.styles';

interface IProps {
	models: any[];
	projects: any[];
	username: string;
	teamspacePerms: string;
	handleResolve: () => void;
	handleClose: () => void;
}
export const RemoveUserDialog = (props: IProps) => {
	const renderItems = (items) => {
		return items.map((item, index) => (<p key={index}>{item.model || item}</p>));
	};

	const description = `\
		User ${props.username} has permissions assigned on the following items,\
		they will be removed together with the user. \
		Do you really want to remove this User?
	`;

	return (
		<>
			<DialogContent>
				{description}
				{ props.projects.length ? (
					<>
						<Headline>Projects: </Headline>
						{renderItems(props.projects)}
					</>
				) : '' }

				{ props.models.length ? (
					<>
						<Headline>Models: </Headline>
						{renderItems(props.models)}
					</>
				) : '' }

				{ props.teamspacePerms ? (
					<>
						<Headline>Teamspace: </Headline>
						<p>{props.teamspacePerms}</p>
					</>
				) : '' }
			</DialogContent>

			<DialogActions>
				<Button onClick={props.handleClose} color="secondary">Cancel</Button>
				<Button onClick={props.handleResolve} variant="contained" color="secondary">Remove</Button>
			</DialogActions>
		</>
	);
};
