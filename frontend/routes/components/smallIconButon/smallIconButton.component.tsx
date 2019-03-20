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
import { Tooltip } from '@material-ui/core';
import { SmallIconButtonStyled } from './smallIconButton.styles';

interface IProps {
	onClick?: (event: React.SyntheticEvent) => void;
	Icon: React.ComponentType;
	tooltip: string;
	disabled?: boolean;
}

export class SmallIconButton extends React.PureComponent<IProps, any> {
	public render() {
		const { Icon, tooltip, onClick, disabled = false } = this.props;
		return (
			<Tooltip title={tooltip}>
				<SmallIconButtonStyled
					component="span"
					aria-label={tooltip}
					onClick={onClick}
					disabled={disabled}
					>
					<Icon />
				</SmallIconButtonStyled>
			</Tooltip>
		);
	}
}
