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
import { isEmpty } from 'lodash';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

import { StyledGrid, StyledGrow } from './rowMenu.styles';

interface IProps {
	open?: boolean;
	onClick: () => void;
}

interface IState {
	open: boolean;
	forceOpen: boolean;
}

export class RowMenu extends React.PureComponent<IProps, IState> {
	public state = {
		open: false,
		forceOpen: false
	};

	public componentDidUpdate(prevProps: IProps) {
		const changes = {} as IState;

		if (this.props.open !== prevProps.open) {
			changes.open = this.props.open;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public render() {
		const { children, onClick } = this.props;
		const { open } = this.state;

		return (
			<StyledGrid
				container
				wrap="nowrap"
				direction="row"
				alignItems="center"
				justify="flex-start"
			>
				<StyledGrow in={open}>
					<StyledGrid
						container
						wrap="nowrap"
						direction="row"
						alignItems="center"
						justify="flex-start"
					>
					{children}
					</StyledGrid>
				</StyledGrow>
				<IconButton aria-label="Toggle menu" onClick={onClick}>
					<Icon fontSize="small">more_vert</Icon>
				</IconButton>
			</StyledGrid>
		);
	}
}
