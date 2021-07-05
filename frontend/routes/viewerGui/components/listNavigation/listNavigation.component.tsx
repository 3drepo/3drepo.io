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

import React from 'react';

import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';

import { LockPanelButton } from '../panelBarActions/lockPanelButton';
import { Container, StyledIconButton } from './listNavigation.styles';

interface IProps {
	panelType?: string;
	className?: string;
	initialIndex?: number;
	itemsCount: number;
	onChange: (currentIndex: number) => void;
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

	public handleNavigation = ( skip ) => {
		const index =  (this.props.itemsCount +  this.state.currentIndex + skip) % this.props.itemsCount ;
		this.setState({ currentIndex: index }, this.handleChange);
	}

	public handlePrevItem = () => {
		this.handleNavigation(-1);
	}

	public handleNextItem = () => {
		this.handleNavigation(1);
	}

	public render() {
		const { panelType } = this.props;
		return (
			<Container>
				{panelType && <LockPanelButton type={panelType} />}
				<StyledIconButton onClick={this.handlePrevItem}>
					<SkipPreviousIcon />
				</StyledIconButton>
				<StyledIconButton onClick={this.handleNextItem}>
					<SkipNextIcon />
				</StyledIconButton>
			</Container>
		);
	}
}
