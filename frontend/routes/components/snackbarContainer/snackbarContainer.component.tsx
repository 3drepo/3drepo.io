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

import Snackbar from '@material-ui/core/Snackbar';
import React from 'react';

import { DefaultSnackbar } from './components/defaultSnackbar/defaultSnackbar.component';

interface IProps {
	snack: any;
	close: () => void;
}

interface IState {
	isOpen: boolean;
	snack: any;
}

export class SnackbarContainer extends React.PureComponent<IProps, IState> {
	public queue = [];

	public state = {
		isOpen: false,
		snack: {}
	};

	public processQueue = () => {
		if (this.queue.length > 0) {
			this.setState({
				snack: this.queue.shift(),
				isOpen: true
			});
		}
	}

	public handleNewSnack = (snack) => {
		this.queue.push(snack);

		if (this.state.isOpen) {
			this.setState({ isOpen: false });
		} else {
			this.processQueue();
		}
	}

	public componentDidMount() {
		if (this.props.snack.key) {
			this.handleNewSnack(this.props.snack);
		}
	}

	public componentDidUpdate(prevProps) {
		if (this.props.snack.key && this.props.snack.key !== prevProps.snack.key) {
			this.handleNewSnack(this.props.snack);
		}
	}

	public handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		this.setState({
			isOpen: false
		}, this.props.close);
	}

	public handleExited = () => {
		this.processQueue();
	}

	public render() {
		const {isOpen, snack} = this.state;
		const {message, ...snackProps} = snack as any;
		return (
			<Snackbar
				autoHideDuration={5000}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				onClose={this.handleClose}
				onExited={this.handleExited}
				open={isOpen}
				{...snackProps}
			>
				<DefaultSnackbar
					message={message}
					onClose={this.handleClose}
				/>
			</Snackbar>
		);
	}
}
