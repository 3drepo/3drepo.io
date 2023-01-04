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

import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { isV5 } from '@/v4/helpers/isV5';

import { LockPanelButton } from '../panelBarActions/lockPanelButton';
import { Container, SkipNextIconV5, SkipPreviousIconV5, StyledIconButton } from './listNavigation.styles';

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

export class ListNavigation extends PureComponent<IProps, IState> {
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
					{isV5() ? <SkipPreviousIconV5 /> : <SkipPreviousIcon />}
				</StyledIconButton>
				<StyledIconButton onClick={this.handleNextItem}>
					{isV5() ? <SkipNextIconV5 /> : <SkipNextIcon />}
				</StyledIconButton>
			</Container>
		);
	}
}
