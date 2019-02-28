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
import ChipComponent, { ChipProps } from '@material-ui/core/Chip';

import { Container } from './chip.styles';

interface IProps {
	className?: string;
	active?: string;
}

interface IState {
}

const ChipWrapper = ({ children, ...props }) => (
	<Container {...props}>{children}</Container>
);

export class Chip extends React.PureComponent<ChipProps & IProps, IState> {
	public state = {
		active: false
	};

	public getWrapperComponent = (chipProps) => {
		const { className, active } = this.props;
		return (
			<ChipWrapper
				{...chipProps}
				color={active ? 'primary' : chipProps.color}
				className={className}
			/>
		);
	}

	public render() {
		const { className, ...chipsProps } = this.props;
		return (
			<ChipComponent
				{...chipsProps}
				component={this.getWrapperComponent}
			/>
		);
	}
}
