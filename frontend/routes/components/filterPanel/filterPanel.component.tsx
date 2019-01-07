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

import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import Chip from '@material-ui/core/Chip';
import Input from '@material-ui/core/Input';

import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { FiltersMenu } from '../filtersMenu/filtersMenu.component';
import { Container, SelectedFilters, InputContainer } from './filterPanel.styles';

interface IProps {
	filters: any[];
	onChange: (selectedFilters) => void;
}

interface IState {
	selectedFilters: any[];
}

const MenuButton = ({ IconProps, Icon, ...props }) => (
	  <IconButton
	    {...props}
	    aria-label="Show filters menu"
	    aria-haspopup="true"
	  >
	    <MoreIcon {...IconProps} />
	  </IconButton>
	);

export class FilterPanel extends React.PureComponent<IProps, IState> {
	public state = {
		selectedFilters: []
	};

  public renderFiltersMenu = () => (
	    <FiltersMenu
				items={this.props.filters}
				selectedItems={this.state.selectedFilters}
				onToggleFilter={this.onToggleFilter}
	    />
	  )

	public onDeselectFilter = (selectedFilter) => {
		this.setState({
			selectedFilters: this.state.selectedFilters.filter(
				(filter) => filter.value.value !== selectedFilter.value.value
			)
		}, () => {
			this.props.onChange(this.state.selectedFilters);
		});
	}

	public onSelectFilter = (parent, child) => {
		const newSelectedFilter = {
			label: parent.label,
			type: parent.type,
			value: {
				label: child.label,
				value: child.value
			}
		};
		this.setState((prevState) => ({
			selectedFilters: [...prevState.selectedFilters, newSelectedFilter]
		}), () => {
			this.props.onChange(this.state.selectedFilters);
		});
	}

	public onToggleFilter = (parent, child) => {
		const foundedFilter = this.state.selectedFilters.find((filter) => filter.value.value === child.value);

		if (foundedFilter) {
			this.onDeselectFilter(foundedFilter);
		} else {
			this.onSelectFilter(parent, child);
		}
	}

	public render() {
		return (
			<Container>
				<SelectedFilters>
					{ this.state.selectedFilters.map(
							(filter, index) => (
								<Chip
									key={index}
									label={`${filter.label}: ${filter.value.label}`}
									onDelete={() => this.onDeselectFilter(filter)}
								/>
							)
						)
					}
				</SelectedFilters>
				<InputContainer>
					<Input />
					<ButtonMenu
						renderButton={MenuButton}
						renderContent={this.renderFiltersMenu}
						PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
						PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
						ButtonProps={{ disabled: false }}
					/>
				</InputContainer>
			</Container>
		);
	}
}
