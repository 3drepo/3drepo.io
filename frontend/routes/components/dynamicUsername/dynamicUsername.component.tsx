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
import Tooltip from '@material-ui/core/Tooltip';
import { Container, Username, TooltipText, FullName, CompanyName } from './dynamicUsername.styles';

interface IProps {
	name: string;
	teamspace: string;
	fetchUserDetails: (teamspace, username) => void;
	userDetails: any;
}

export class DynamicUsername extends React.PureComponent<IProps, any> {
	public handleOnHover = () => {
		this.props.fetchUserDetails(this.props.teamspace, this.props.name);
	}

	get tootliptText() {
		if (this.props.userDetails) {
			const { firstName, lastName, company } = this.props.userDetails;
			return (
				<TooltipText>
					<FullName>{firstName} {lastName}</FullName>
					<CompanyName>{company}</CompanyName>
				</TooltipText>
			);
		}
		return '';
	}

	public render() {
		return (
			<Container onMouseEnter={this.handleOnHover}>
				<Tooltip title={this.tootliptText}>
					<Username>{this.props.name}</Username>
				</Tooltip>
			</Container>
		);
	}
}
