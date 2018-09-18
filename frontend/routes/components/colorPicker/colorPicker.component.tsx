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
import Popover from '@material-ui/core/Popover';

import { Panel, Dot, ColorSelect } from './colorPicker.styles';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';

interface IProps {
	value?: string;
	predefinedColors?: string[];
	onChange?: (color) => void;
}

interface IState {
	anchorEl: HTMLElement;
	open: boolean;
}

export class ColorPicker extends React.PureComponent<IProps, IState> {
	public state = {
		anchorEl: null,
		open: false
	};

	public handleClick = (event) => {
		const { currentTarget } = event;
		this.setState((state) => ({
			anchorEl: currentTarget,
			open: !state.open
		}));
	}

	public handleClose = () => {
		this.setState({
			anchorEl: null,
			open: false
		});
	}

	public componentDidUpdate(prevProps, prevState) {
		if (prevState.open !== this.state.open && !this.state.open) {
			this.handleClose();
		}
	}

	public setupCanvases = () => {

	}

	public render() {
		const {value} = this.props;
		const {open} = this.state;

		return (
			<>
				<ColorSelect
					container
					onClick={this.handleClick}
					direction="row"
					alignItems="center"
					justify="flex-start"
				>
					<Dot item color={value}></Dot>
					<Grid item>
						<IconButton>
							<Icon>arrow_drop_down</Icon>
						</IconButton>
					</Grid>
				</ColorSelect>

				<Panel
					open={open}
					onClose={this.handleClose}
					onEnter={this.setupCanvases}
				>
					<canvas></canvas>
					<canvas></canvas>
				</Panel>
			</>
		);
	}
}
