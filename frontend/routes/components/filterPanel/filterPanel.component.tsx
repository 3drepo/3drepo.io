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
import * as Autosuggest from 'react-autosuggest';
import { omit, cloneDeep } from 'lodash';
import * as dayjs from 'dayjs';

import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';

import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { FiltersMenu } from '../filtersMenu/filtersMenu.component';
import {
	Container, SelectedFilters, InputContainer, SuggestionsList, StyledTextField, StyledChip
} from './filterPanel.styles';

export const dateType = 'DATE';

interface IProps {
	filters: any[];
	onChange: (selectedFilters) => void;
}

interface IState {
	selectedFilters: any[];
	value: any;
	suggestions: any[];
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

const getSuggestionValue = (suggestion) => suggestion.name;

export class FilterPanel extends React.PureComponent<IProps, IState> {
	public state = {
		selectedFilters: [],
		value: '',
		suggestions: []
	};

	private popperNode = null;

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

	public onSelectFilter = (parent, child, founded = false) => {
		const newSelectedFilter = {
			label: parent.label,
			type: parent.type,
			value: {
				label: child.label,
				value: child.value
			} as any
		};

		if (parent.type === dateType && child.date) {
			newSelectedFilter.label = child.label;
			newSelectedFilter.value.label = dayjs(child.date).format('DD/MM/YYYY');
			if (!founded) {
				this.setState((prevState) => ({
					selectedFilters: [...prevState.selectedFilters, newSelectedFilter]
				}), () => {
					this.props.onChange(this.state.selectedFilters);
				});
			} else {
				const dateFilterIndex = this.state.selectedFilters.findIndex((filter) => filter.value.value === child.value);
				const selectedFilters = cloneDeep(this.state.selectedFilters);
				selectedFilters[dateFilterIndex].value.label = dayjs(child.date).format('DD/MM/YYYY');
				this.setState(() => ({ selectedFilters }), () => {
					this.props.onChange(this.state.selectedFilters);
				});
			}
		}

		if (!founded && parent.type !== dateType) {
			this.setState((prevState) => ({
				selectedFilters: [...prevState.selectedFilters, newSelectedFilter]
			}), () => {
				this.props.onChange(this.state.selectedFilters);
			});
		}
	}

	public onToggleFilter = (parent, child) => {
		const foundedFilter = this.state.selectedFilters.find((filter) => filter.value.value === child.value);

		if (foundedFilter && parent.type !== dateType) {
			this.onDeselectFilter(foundedFilter);
		} else {
			this.onSelectFilter(parent, child, foundedFilter);
		}
	}

	public renderSuggestion = (suggestion, {isHighlighted}) => {
		return (
			<MenuItem selected={isHighlighted} component="div">
				{suggestion.name}
			</MenuItem>
		);
	}

	public mapFiltersToSuggestions = (filters) =>
		filters.map((filter) => filter.values.map((value) => {
			return {
				name: `${filter.label}:${value.label}`,
				label: filter.label,
				type: filter.type,
				value
			};
		})).flat(1)

	public getSuggestions = (value) => {
		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;
		const filterSuggestions = this.mapFiltersToSuggestions(this.props.filters);

		return inputLength === 0 ? [] : filterSuggestions.filter((filterSuggestion) =>
		filterSuggestion.name.toLowerCase().slice(0, inputLength) === inputValue);
	}

	public renderInputComponent = (inputProps) => {
		const {inputRef , ref, ...other} = inputProps;

		return (
			<StyledTextField
				fullWidth={true}
				InputProps={ {
					inputRef: (node) => {
						ref(node);
						inputRef(node);
					}
				} }
				{...other}
			/>
		);
	}

	public renderSuggestionsContainer = (options) => (
		<SuggestionsList
			anchorEl={this.popperNode}
			open={Boolean(options.children)}
			placement="bottom"
		>
			<Paper
				square={true}
				{...options.containerProps}
				style={{ width: this.popperNode ? this.popperNode.clientWidth : null }}
			>
				{options.children}
			</Paper>
		</SuggestionsList>
	)

	public onChange = (event, { newValue }) => {
		this.setState({
			value: newValue
		});
	}

	public handleNewFilterSubmit: any = (event, { suggestion }) => {
		event.preventDefault();

		const newFilter = omit(suggestion, 'name');
		const isAlreadySelected = this.state.selectedFilters.find(((filter) =>
			JSON.stringify(filter) === JSON.stringify(newFilter)
		));

		if (!!isAlreadySelected) {
			this.setState({ value: '' });
		} else {
			this.setState((prevState) => ({
				selectedFilters: [...prevState.selectedFilters, omit(suggestion, 'name')],
				value: ''
			}), () => {
				this.props.onChange(this.state.selectedFilters);
			});
		}
	}

	public onSuggestionsFetchRequested = ({ value }) => {
		this.setState({
			suggestions: this.getSuggestions(value)
		});
	}

	public onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: []
		});
	}

	public render() {
		const { value, suggestions } = this.state;

		return (
			<Container>
				<SelectedFilters>
					{ this.state.selectedFilters.map(
							(filter, index) => (
								<StyledChip
									key={index}
									label={`${filter.label}: ${filter.value.label}`}
									onDelete={() => this.onDeselectFilter(filter)}
								/>
							)
						)
					}
				</SelectedFilters>

				<InputContainer>
					<Autosuggest
						suggestions={suggestions}
						onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
						onSuggestionsClearRequested={this.onSuggestionsClearRequested}
						getSuggestionValue={getSuggestionValue}
						renderSuggestion={this.renderSuggestion}
						renderInputComponent={this.renderInputComponent}
						inputProps={ {
							placeholder: 'Filter',
							value,
							onChange: this.onChange,
							inputRef: (node) => {
								this.popperNode = node;
							}
						} }
						renderSuggestionsContainer={this.renderSuggestionsContainer}
						onSuggestionSelected={this.handleNewFilterSubmit}
					/>
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
