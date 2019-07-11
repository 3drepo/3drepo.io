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

import IconButton from '@material-ui/core/IconButton';
import MoreVert from '@material-ui/icons/MoreVert';
import { isEmpty } from 'lodash';
import * as React from 'react';

import { StyledGrid, StyledGrow } from './rowMenu.styles';

interface IProps {
	open?: boolean;
	disabled?: boolean;
	forceOpen?: boolean;
	toggleForceOpen?: (event) => void;
}

interface IState {
	open: boolean;
	pointerEvents: boolean;
}

export class RowMenu extends React.PureComponent<IProps, IState> {
	public state = {
		open: false,
		pointerEvents: false
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

	public onMenuEnter = () => {
		this.setState({pointerEvents: false});
	}

	public onMenuEntered = () => {
		this.setState({pointerEvents: true});
	}

	public render() {
		const { children, disabled, forceOpen, toggleForceOpen } = this.props;
		const { open } = this.state;

		const growProps = !disabled && {
			in: open || forceOpen,
			onEnter: this.onMenuEnter,
			onEntered: this.onMenuEntered,
			timeout: 300
		};

		return (
			<StyledGrid
				container
				wrap="nowrap"
				direction="row"
				alignItems="center"
				justify="flex-start"
			>
				<StyledGrow
					appear={!disabled}
					{...growProps}
				>
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
				<IconButton aria-label="Toggle menu" onClick={toggleForceOpen} disabled={disabled}>
					<MoreVert fontSize="small" />
				</IconButton>
			</StyledGrid>
		);
	}
}
