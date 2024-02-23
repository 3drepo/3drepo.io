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

import { PureComponent } from 'react';

import { isNumber } from 'lodash';
import { LockPanelButton } from '../panelBarActions/lockPanelButton';
import { Container, SkipNextIcon, SkipPreviousIcon, StyledIconButton } from './listNavigation.styles';

interface IProps {
	panelType?: string;
	className?: string;
	initialIndex?: number;
	itemsCount: number;
	onChange: (currentIndex: number) => void;
}

interface IState {
	currentIndex: number;
	initialItemsCount: number;
}

export class ListNavigation extends PureComponent<IProps, IState> {
	public state = {
		currentIndex: 0,
		initialItemsCount: 0,
	};

	public componentDidMount() {
		if (isNumber(this.props.initialIndex)) {
			this.setState({ currentIndex: this.props.initialIndex, initialItemsCount: this.props.itemsCount });
		}
	}

	public handleChange = () => {
		this.props.onChange(this.state.currentIndex);
	}

	public handleNavigation = ( skip ) => {
		const index =  (this.props.itemsCount +  this.state.currentIndex + skip) % this.props.itemsCount ;
		this.setState({ currentIndex: index, initialItemsCount: this.props.itemsCount }, this.handleChange);
	}

	public handlePrevItem = () => {
		this.handleNavigation(-1);
	}

	public handleNextItem = () => {
		if (this.state.initialItemsCount === this.props.itemsCount) {
			this.handleNavigation(1);
		} else {
			this.handleNavigation(0);
		}
	}

	public render() {
		const { panelType } = this.props;
		const disableArrows = this.state.initialItemsCount <= 1;
		return (
			<Container>
				{panelType && <LockPanelButton type={panelType} />}
				<StyledIconButton onClick={this.handlePrevItem} disabled={disableArrows}>
					<SkipPreviousIcon />
				</StyledIconButton>
				<StyledIconButton onClick={this.handleNextItem} disabled={disableArrows}>
					<SkipNextIcon />
				</StyledIconButton>
			</Container>
		);
	}
}
