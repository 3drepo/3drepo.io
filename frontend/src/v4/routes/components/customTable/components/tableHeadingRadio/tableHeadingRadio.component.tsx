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

import { Grid, Tooltip } from '@material-ui/core';
import React from 'react';

import { SortLabel } from '../tableHeading/tableHeading.styles';
import { RadioButton, RadioContainer } from './tableHeadingRadio.styles';

interface IProps {
	label: string;
	value: any;
	activeSort: boolean;
	sortOrder: 'asc' | 'desc';
	disabled?: boolean;
	checked?: boolean;
	name?: string;
	tooltipText?: string;
	width?: string;
	onChange?: (event, value) => void;
	onClick?: () => void;
}

export class TableHeadingRadio extends React.PureComponent<IProps, any> {
	public state = {
		selectedValue: ''
	};

	public handleChange = (event) => {
		this.props.onChange(event, this.props.value);
	}

	public render() {
		const {
			label, name, disabled, checked, activeSort, sortOrder, onClick, onChange, tooltipText, value, width
		} = this.props;

		const RadioContainerProps = { width };

		return (
			<Tooltip title={tooltipText}>
				<RadioContainer
					container
					direction="column"
					justify="center"
					alignItems="center"
					{...RadioContainerProps}
				>
					<Grid item>
						<SortLabel
							active={activeSort}
							direction={sortOrder}
							onClick={onClick}
						>
							{label}
						</SortLabel>
					</Grid>
					<Grid item>
						<RadioButton
							checked={checked}
							name={name || label}
							disabled={disabled}
							value={value}
							onChange={this.handleChange}
						/>
					</Grid>
				</RadioContainer>
			</Tooltip>
		);
	}
}
