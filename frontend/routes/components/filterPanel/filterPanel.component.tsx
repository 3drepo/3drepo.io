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
import * as dayjs from 'dayjs';
import { omit } from 'lodash';

import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import CollapseIcon from '@material-ui/icons/ExpandMore';
import ExpandIcon from '@material-ui/icons/ChevronRight';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';

import { ENTER_KEY } from '../../../constants/keys';
import { FiltersMenu } from './components/filtersMenu/filtersMenu.component';
import {
	Container,
	SelectedFilters,
	InputContainer,
	SuggestionsList,
	StyledTextField,
	StyledChip,
	FiltersButton,
	ButtonContainer,
	StyledIconButton,
	StyledMoreIcon,
	ButtonWrapper
} from './filterPanel.styles';
import { compareStrings } from '../../../helpers/searching';

export const DATA_TYPES = {
	UNDEFINED: 1,
	DATE: 2,
	QUERY: 3
};

interface IFilter {
	values: any;
	label: string;
	type?: number;
}

interface ISelectedFilter {
	value: any;
	label: string;
	relatedField: string;
	type?: number;
}

interface IProps {
	filters: IFilter[];
	onChange: (selectedFilters) => void;
	selectedFilters: any[];
}

interface IState {
	selectedFilters: any[];
	value: any;
	suggestions: any[];
	filtersOpen: boolean;
}

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<ButtonWrapper>
	  <StyledIconButton
	    {...props}
	    aria-label="Show filters menu"
	    aria-haspopup="true"
	  >
	    <StyledMoreIcon {...IconProps} />
	  </StyledIconButton>
	</ButtonWrapper>
);

const getSuggestionValue = (suggestion) => suggestion.name;

const mapFiltersToSuggestions = (filters) => {
	return filters
		.filter((suggestion) => suggestion.type !== DATA_TYPES.DATE)
		.map((filter) => filter.values.map((value) => {
			return {
				name: `${filter.label}:${value.label}`,
				label: filter.label,
				relatedField: filter.relatedField,
				type: filter.type,
				value
			};
	})).flat();
};

export class FilterPanel extends React.PureComponent<IProps, IState> {
	public state = {
		selectedFilters: [],
		value: '',
		suggestions: [],
		filtersOpen: false
	};

	private popperNode = null;
	private filterSuggestions = [];

	public componentDidMount = () => {
		this.setState({ selectedFilters: this.props.selectedFilters });
		this.filterSuggestions = mapFiltersToSuggestions(this.props.filters);
	}

	public componentDidUpdate(prevProps) {
		if (this.props.filters.length !== prevProps.filters.length) {
			this.filterSuggestions = mapFiltersToSuggestions(this.props.filters);
		}
	}

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
		}, this.handleFiltersChange);
	}

	public onSelectDateFilter = (dateFilter, child, found) => {
		dateFilter.label = child.label;
		dateFilter.value.label = dayjs(child.date).format('DD/MM/YYYY');

		if (!found) {
			this.setState((prevState) => ({
				selectedFilters: [...prevState.selectedFilters, dateFilter]
			}), this.handleFiltersChange);
		} else {
			const selectedFilters = { ...this.state.selectedFilters };
			selectedFilters[dateFilter.label].value.label = dayjs(child.date).format('DD/MM/YYYY');
			this.setState({ selectedFilters }, this.handleFiltersChange);
		}
	}

	public onSelectFilter = (parent, child, found = false) => {
		const newSelectedFilter: ISelectedFilter = {
			label: parent.label,
			type: parent.type,
			relatedField: parent.relatedField,
			value: {
				label: child.label,
				value: child.value
			}
		};

		if (parent.type === DATA_TYPES.DATE && child.date) {
			this.onSelectDateFilter(newSelectedFilter, child, found);
		}

		if (!found && parent.type !== DATA_TYPES.DATE) {
			this.setState((prevState) => ({
				selectedFilters: [...prevState.selectedFilters, newSelectedFilter]
			}), this.handleFiltersChange);
		}
	}

	public onToggleFilter = (parent, child) => {
		const foundFilter = this.state.selectedFilters.find((filter) =>
			filter.label === parent.label && filter.value.value === child.value
		);

		if (foundFilter && parent.type !== DATA_TYPES.DATE) {
			this.onDeselectFilter(foundFilter);
		} else {
			this.onSelectFilter(parent, child, foundFilter);
		}
	}

	public renderSuggestion = (suggestion, { isHighlighted }) => (
		<MenuItem selected={isHighlighted} component="div">
			{suggestion.name}
		</MenuItem>
	)

	public getSuggestions = (value) => {
		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;

		if (inputLength === 0) {
			return [];
		}

		return this.filterSuggestions.filter(({ name }) => compareStrings(name, inputValue));
	}

	public handlePaste = (event) => {
		event.preventDefault();

		try {
			const newSelectedFilters = JSON.parse(event.clipboardData.getData('text'));
			this.setState((prevState) => ({
				selectedFilters: [
					...prevState.selectedFilters,
					...newSelectedFilters
				]
			}));
		} catch (error) {
			console.error('Unsupported filters format');
		}
	}

	public renderInputComponent = (inputProps) => {
		const {inputRef , ref, ...other} = inputProps;

		return (
			<StyledTextField
				autoFocus
				onPaste={this.handlePaste}
				fullWidth
				InputProps={{
					inputRef: (node) => {
						ref(node);
						inputRef(node);
					}
				}}
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

	public onSearchChange = (event, { newValue }) => {
		this.setState({ value: newValue });
	}

	public handleFiltersChange = () => {
		this.props.onChange(this.state.selectedFilters);
	}

	public onSearchSubmit = (event) => {
		if (event.key === ENTER_KEY) {
			event.preventDefault();
			const queryValue = event.target.value;
			const newFilter = {
				label: queryValue,
				type: DATA_TYPES.QUERY,
				value: {
					value: queryValue
				}
			};
			this.setState((prevState) => ({
				selectedFilters: [...prevState.selectedFilters, newFilter],
				value: ''
			}), this.handleFiltersChange);
		}
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
			}), this.handleFiltersChange);
		}
	}

	public onSuggestionsFetchRequested = ({ value }) => {
		this.setState({
			suggestions: this.getSuggestions(value)
		});
	}

	public onSuggestionsClearRequested = () => {
		this.setState({ suggestions: [] });
	}

	public collapseFilters = () => {
		this.setState({ filtersOpen: true });
	}

	public expandFilters = () => {
		this.setState({ filtersOpen: false });
	}

	public renderFilterButton = () => {
		if (this.state.filtersOpen) {
			return(
				<FiltersButton color="inherit" onClick={this.expandFilters}>
					<ExpandIcon />
				</FiltersButton>
			);
		} else {
			return(
				<FiltersButton color="inherit" onClick={this.collapseFilters}>
					<CollapseIcon />
				</FiltersButton>
			);
		}
	}

	public renderSelectedFilters = () => (
		<SelectedFilters
			empty={!this.state.selectedFilters.length}
			filtersOpen={this.state.selectedFilters.length && this.state.filtersOpen}
		>
			{this.state.selectedFilters.length ? this.renderFilterButton() : null}

			{this.state.selectedFilters.map(
				(filter, index) => (
					<StyledChip
						key={index}
						label={filter.type !== DATA_TYPES.QUERY ? `${filter.label}: ${filter.value.label}` : filter.label}
						onDelete={() => this.onDeselectFilter(filter)}
					/>
				)
			)
			}
		</SelectedFilters>
	)

	public render() {
		const { value, suggestions } = this.state;

		return (
			<Container filtersOpen={this.state.selectedFilters.length && this.state.filtersOpen}>
				{this.renderSelectedFilters()}

				<InputContainer>
					<Autosuggest
						suggestions={suggestions}
						onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
						onSuggestionsClearRequested={this.onSuggestionsClearRequested}
						getSuggestionValue={getSuggestionValue}
						renderSuggestion={this.renderSuggestion}
						renderInputComponent={this.renderInputComponent}
						inputProps={{
							placeholder: 'Filter',
							value,
							onChange: this.onSearchChange,
							onKeyPress: this.onSearchSubmit,
							inputRef: (node) => {
								this.popperNode = node;
							}
						}}
						renderSuggestionsContainer={this.renderSuggestionsContainer}
						onSuggestionSelected={this.handleNewFilterSubmit}
					/>
					<ButtonContainer>
						<ButtonMenu
							renderButton={MenuButton}
							renderContent={this.renderFiltersMenu}
							PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
							PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
							ButtonProps={{ disabled: false }}
						/>
					</ButtonContainer>
				</InputContainer>

			</Container>
		);
	}
}
