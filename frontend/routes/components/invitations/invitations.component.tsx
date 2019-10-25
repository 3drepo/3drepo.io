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

import RemoveCircle from '@material-ui/icons/RemoveCircle';
import React from 'react';
import ReactDOM from 'react-dom';

interface IProps {
	invitations: any[];
	removeInvitation: (email) => void;
}

interface IState {
	stuff: string;
}

const Invitation = ({email, removeInvitation}) => {
	const onClick = (e: any) => {
		e.preventDefault();
		console.log("delete" + email);
		removeInvitation(email);
	};

	return (
		<>
			<p key={email}>{email}</p>
			<a href="" onClick={onClick}>x</a>
		</>
	);
};

const InvitationsList = ({invitations, removeInvitation}) =>
	invitations.map(({email}, index) =>
		(<Invitation key={email} removeInvitation={removeInvitation} email={email} />));

export class Invitations extends React.PureComponent<IProps, IState> {
	public render() {
		const { invitations, removeInvitation } = this.props;

		return (
			<div style={{width: 300, height: 300}}>
				<InvitationsList invitations={invitations} removeInvitation={removeInvitation} />
			</div>
			);
	}
}
