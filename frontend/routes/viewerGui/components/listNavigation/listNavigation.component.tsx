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

import { IconButton } from '@material-ui/core';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import React from 'react';

import { Container } from './listNavigation.styles';

interface IProps {
	className?: string;
	initialIndex?: number;
	lastIndex: number;
	onChange: (currentIndex) => void;
}

interface IState {
	currentIndex: number;
}

export class ListNavigation extends React.PureComponent<IProps, IState> {
	public state = {
		currentIndex: 0
	};

	public componentDidMount() {
		if (this.props.initialIndex) {
			this.setState({ currentIndex: this.props.initialIndex });
		}
	}

	public handleChange = () => {
		this.props.onChange(this.state.currentIndex);
	}

	public handlePrevItem = () => {
		const index = this.state.currentIndex;
		const prevIndex = index === 0 ? this.props.lastIndex : index - 1;
		this.setState({ currentIndex: prevIndex }, this.handleChange);
	}

	public handleNextItem = () => {
		const index = this.state.currentIndex;
		const nextIndex = index === this.props.lastIndex ? 0 : index + 1;
		this.setState({ currentIndex: nextIndex }, this.handleChange);
	}

	public render() {
		return (
			<Container>
				<IconButton onClick={this.handlePrevItem}>
					<SkipPreviousIcon />
				</IconButton>
				<IconButton onClick={this.handleNextItem}>
					<SkipNextIcon />
				</IconButton>
			</Container>
		);
	}
}
