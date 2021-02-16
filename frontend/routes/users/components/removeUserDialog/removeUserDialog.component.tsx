import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import React from 'react';

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
