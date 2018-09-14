import * as React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';

import { Headline } from './removeUserDialog.styles';

interface IProps {
	models: any[];
	projects: any[];
	username: string;
	teamspacePerms: string;
	handleResolve: () => string;
	handleCancel: () => string;
}
export const RemoveUserDialog = (props) => {
	const renderItems = (items) => {
		return items.map((item, index) => (<p key={index}>{item.model || item}</p>));
	};

	const description = `\
		User ${props.username} has permissions assigned on the following items,\
		they will be removed together with the license. \
		Do you really want to remove this license?
	`;

	return (
		<>
			<DialogContent>
				{description}
				{props.projects.length ? (
					<>
						<Headline>Projects: </Headline>
						{renderItems(props.projects)}
					</>
				) : ''}

				{props.models.length ? (
					<>
						<Headline>Models: </Headline>
						{renderItems(props.models)}
					</>
				) : ''}
			</DialogContent>

			<DialogActions>
				<Button onClick={props.handleClose} color="primary">Cancel</Button>;
				<Button onClick={props.handleResolve} color="primary">Remove</Button>;
			</DialogActions>
		</>
	);
};