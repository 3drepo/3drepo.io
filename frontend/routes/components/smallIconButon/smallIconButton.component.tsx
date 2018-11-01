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

import { Icon, Tooltip } from '@material-ui/core';
import * as React from 'react';
import { SmallIconButtonStyled } from './smallIconButton.styles';

interface IProps {
	onClick?: (event: React.SyntheticEvent) => void;
	tooltip: string;
}

export class SmallIconButton extends React.PureComponent<IProps, any> {
	public state = {

	};

	public render = () => {

		return (
			<Tooltip title={this.props.tooltip}>
			<SmallIconButtonStyled component="span"
				aria-label={this.props.tooltip}
				onClick={this.props.onClick}>
				<Icon>{this.props.children}</Icon>
			</SmallIconButtonStyled>
		</Tooltip>
		);
	}
}
