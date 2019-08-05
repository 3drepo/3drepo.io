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

import { snakeCase } from 'lodash';
import React from 'react';

import { Chip, Input } from '@material-ui/core';
import { ENTER_KEY } from '../../../constants/keys';
import { ChipsContainer, ChipsGrid } from './chips.styles';

interface IProps {
	name: string;
	inputPlaceholder: string;
	value: any[];
	onChange: (event) => void;
	onBlur: (event) => void;
}

interface IState {
	value: any[];
}

export class Chips extends React.PureComponent<IProps, IState> {
	public state = {
		value: []
	};

	public componentDidMount() {
		this.setState({ value: this.props.value });
	}

	public handleChange = () => {
		if (this.props.onChange) {
			this.props.onChange({
				target: {
					value: this.state.value,
					name: this.props.name
				}
			});
		}
	}

	public handleNewChipSubmit: any = (event) => {
		if (event.key === ENTER_KEY) {
			event.preventDefault();

			const newChip = {
				value: snakeCase(event.target.value),
				label: event.target.value
			};

			const chipExists = !!this.state.value.find((chip) => (chip.value === newChip.value));

			if (!chipExists) {
				this.setState({
					value: [...this.state.value, newChip]
				}, this.handleChange);
			}

			event.target.value = '';
		}
	}

	public deleteChip = (type) => () => {
		this.setState({
			value: this.state.value.filter((typeItem) => typeItem.value !== type.value)
		}, this.handleChange);
	}

	public render() {
		const { name, onBlur, value, inputPlaceholder } = this.props;

		return (
			<ChipsGrid container direction="column">
				<ChipsContainer>
					{ value.map(
						(chip, index) => (
							<Chip
								key={index}
								label={chip.label}
								onDelete={this.deleteChip(chip)}
							/>
						)
					) }
				</ChipsContainer>
				<Input
					onKeyPress={this.handleNewChipSubmit}
					placeholder={inputPlaceholder}
					onBlur={onBlur}
					name={name}
				/>
			</ChipsGrid>
		);
	}
}
