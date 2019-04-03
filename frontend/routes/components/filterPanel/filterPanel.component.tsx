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
import { omit, isNil, uniqBy, pick, keyBy } from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CollapseIcon from '@material-ui/icons/ExpandMore';
import ExpandIcon from '@material-ui/icons/ChevronRight';

import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';

import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { Highlight } from '../highlight/highlight.component';
import { ENTER_KEY, BACKSPACE } from '../../../constants/keys';
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
	MoreIcon,
	CopyIcon,
	ButtonWrapper,
	Chips
} from './filterPanel.styles';
import { compareStrings } from '../../../helpers/searching';
import { renderWhenTrue } from '../../../helpers/rendering';

export const DATA_TYPES = {
	UNDEFINED: 1,
	DATE: 2,
	QUERY: 3
};

export interface IFilter {
	values: any;
	label?: string;
	type?: number;
}

export interface ISelectedFilter {
	value: any;
	label: string;
	relatedField: string;
	type?: number;
}

interface IProps {
	filters?: IFilter[];
	onChange: (selectedFilters) => void;
	selectedFilters: any[];
	hideMenu?: boolean;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
}

interface IState {
	selectedFilters: any[];
	value: any;
	suggestions: any[];
	filtersOpen: boolean;
}

const getMenuButton = (InitialIcon) => ({ IconProps, Icon, ...props }: { Icon?, IconProps: any }) => (
	<ButtonWrapper>
		<StyledIconButton
			{...props}
			aria-label="Show filters menu"
			aria-haspopup="true"
		>
			<InitialIcon {...IconProps} />
		</StyledIconButton>
	</ButtonWrapper>
);

const CopyButton = getMenuButton(CopyIcon) as any;
const MoreButton = getMenuButton(MoreIcon);

const getSuggestionValue = (suggestion) => suggestion.name;

const getFilterName = (filterLabel, valueLabel) => {
	const basicName = filterLabel ? `${filterLabel}: ` : '';
	return `${basicName}${valueLabel}`;
};

const getSelectedFilterLabel = (filter) => {
	if (filter.type !== DATA_TYPES.QUERY) {
		return `${filter.label}: ${filter.value.label}`;
	}

	return filter.label || filter.value.label;
};

const mapFiltersToSuggestions = (filters, selectedFilters) => {
	const selectedFiltersMap = keyBy(selectedFilters, ({ label, value }) => `${label}:${value.label}`);
	return filters.reduce((suggestions, currentFilter) => {
		if (currentFilter.type !== DATA_TYPES.DATE) {
			for (let index = 0; index < currentFilter.values.length; index++) {
				const value = currentFilter.values[index];
				const name = `${currentFilter.label}:${value.label}`;

				if (!selectedFiltersMap[name]) {
					suggestions.push({
						name: getFilterName(currentFilter.label, value.label),
						label: currentFilter.label,
						relatedField: currentFilter.relatedField,
						type: currentFilter.type,
						value
					});
				}
			}
		}
		return suggestions;
	}, []);
};

export class FilterPanel extends React.PureComponent<IProps, IState> {
	public state = {
		selectedFilters: [],
		value: '',
		suggestions: [],
		filtersOpen: false,
		removableFilterIndex: null
	};

	public static defaultProps = {
		filters: [],
		placeholder: 'Filter',
		autoFocus: true
	};

	private popperNode = null;
	private filterSuggestions = [];

	public componentDidMount = () => {
		this.setState({ selectedFilters: this.props.selectedFilters });
		this.filterSuggestions = mapFiltersToSuggestions(
			this.props.filters,
			this.state.selectedFilters
		);
	}

	public componentDidUpdate(prevProps, prevState) {
		const filtersChanged = this.props.filters.length !== prevProps.filters.length;
		const selectedFiltersChanged = this.state.selectedFilters.length !== prevState.selectedFilters.length;
		if (filtersChanged || selectedFiltersChanged) {
			this.filterSuggestions = mapFiltersToSuggestions(
				this.props.filters,
				this.state.selectedFilters
			);
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

	public onSelectDateFilter = (dateFilter, child) => {
		dateFilter.label = child.label;
		dateFilter.value.label = dayjs(child.date).format('DD/MM/YYYY');
		const selectedFilterIndex = this.state.selectedFilters.findIndex((filter) => filter.value.value === child.value);

		if (selectedFilterIndex > -1) {
			this.setState((prevState) => {
				const newFilters = [...prevState.selectedFilters];
				newFilters[selectedFilterIndex].label = child.label;
				newFilters[selectedFilterIndex].value.label = dayjs(child.date).format('DD/MM/YYYY');
				return newFilters as any;
			}, this.handleFiltersChange);
		} else {
			this.setState((prevState) => ({
				selectedFilters: [...prevState.selectedFilters, dateFilter]
			}), this.handleFiltersChange);
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
			newSelectedFilter.value.date = child.date;
			this.onSelectDateFilter(newSelectedFilter, child);
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

	public renderSuggestion = (suggestion, { isHighlighted, query }) => (
		<MenuItem selected={isHighlighted} component="div">
			<Highlight text={suggestion.name} search={query} />
		</MenuItem>
	)

	public getSuggestions = (value, selectedFilters) => {
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
				selectedFilters: uniqBy([
					...prevState.selectedFilters,
					...newSelectedFilters
				], (filter) => JSON.stringify(filter))
			}));
		} catch (error) {
			console.error('Unsupported filters format');
		}
	}

	public renderInputComponent = (inputProps) => {
		const {inputRef , ref, ...other} = inputProps;

		return (
			<StyledTextField
				autoFocus={this.props.autoFocus}
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
		this.resetRemovableFilterIndex();
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

	public resetRemovableFilterIndex = () => {
		this.setState({ removableFilterIndex: null } as any);
	}

	public onBackspaceClick = (event) => {
		if (event.key === BACKSPACE) {
			const changes = {
				removableFilterIndex: null
			} as any;

			if (!event.target.value.length) {
				if (!isNil(this.state.removableFilterIndex)) {
					changes.selectedFilters = [...this.state.selectedFilters],
					changes.selectedFilters.pop();
					changes.removableFilterIndex = changes.selectedFilters.length - 1;
					this.setState(changes, () => {
						this.props.onChange(this.state.selectedFilters);
					});
				} else {
					changes.removableFilterIndex = this.state.selectedFilters.length - 1;
					this.setState(changes);
				}
			}
		} else if (!event.target.value.length) {
			this.resetRemovableFilterIndex();
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
			suggestions: this.getSuggestions(value, this.state.selectedFilters)
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

	public renderSelectedFilters = () => {
		const { selectedFilters, filtersOpen, removableFilterIndex } = this.state;
		return (
			<SelectedFilters
				empty={!selectedFilters.length}
				filtersOpen={selectedFilters.length && filtersOpen}
			>
				{selectedFilters.length ? this.renderFilterButton() : null}
				<Chips filtersOpen={selectedFilters.length && filtersOpen} className={this.props.className}>
					{selectedFilters.map(
						(filter, index) => (
							<StyledChip
								key={index}
								color={index === removableFilterIndex ? 'primary' : 'default'}
								label={getSelectedFilterLabel(filter)}
								onDelete={() => this.onDeselectFilter(filter)}
							/>
						)
					)
					}
				</Chips>
			</SelectedFilters>
		);
	}

	public handleKeyUp = () => {
		const list = document.querySelector('.react-autosuggest__suggestions-list');
		if (list) {
			const item = list.querySelector('[aria-selected="true"]') as any;
			if (item) {
				list.scrollTo({
					top: item.offsetTop + item.clientHeight - list.clientHeight,
					behavior: 'smooth'
				});
			}
		}
	}

	public handleAutoSuggestMount = (autoSuggestComponent) => {
		if (autoSuggestComponent && autoSuggestComponent.input) {
			autoSuggestComponent.input.addEventListener('keyup', this.handleKeyUp);
		}
	}

	public renderCopyButton = renderWhenTrue(() => (
		<CopyToClipboard text={JSON.stringify(this.props.selectedFilters)}>
			<ButtonContainer>
				<CopyButton IconProps={{size: 'small'}} disabled={!this.props.selectedFilters.length} />
			</ButtonContainer>
		</CopyToClipboard>
	));

	public renderFiltersMenuButton = renderWhenTrue(() => (
		<ButtonContainer>
			<ButtonMenu
				renderButton={MoreButton}
				renderContent={this.renderFiltersMenu}
				PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
				PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
				ButtonProps={{ disabled: false }}
			/>
		</ButtonContainer>
	));

	public get onlyCopyButton() {
		const onlyQueryFilters = this.props.filters.every((filter) => filter.type === DATA_TYPES.QUERY);
		return onlyQueryFilters;
	}

	public render() {
		const { value, suggestions, selectedFilters, filtersOpen } = this.state;
		const { hideMenu, filters } = this.props;

		return (
			<Container filtersOpen={selectedFilters.length && filtersOpen} className={this.props.className}>
				{this.renderSelectedFilters()}

				<InputContainer menuHidden={hideMenu}>
					<Autosuggest
						ref={this.handleAutoSuggestMount}
						suggestions={suggestions}
						onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
						onSuggestionsClearRequested={this.onSuggestionsClearRequested}
						getSuggestionValue={getSuggestionValue}
						renderSuggestion={this.renderSuggestion}
						renderInputComponent={this.renderInputComponent}
						inputProps={{
							placeholder: this.props.placeholder,
							value,
							onChange: this.onSearchChange,
							onKeyPress: this.onSearchSubmit,
							onKeyDown: this.onBackspaceClick,
							inputRef: (node) => {
								this.popperNode = node;
							}
						}}
						renderSuggestionsContainer={this.renderSuggestionsContainer}
						onSuggestionSelected={this.handleNewFilterSubmit}
					/>
					{this.renderCopyButton((!hideMenu && !filters.length) || this.onlyCopyButton)}
					{this.renderFiltersMenuButton(!hideMenu && filters.length && !this.onlyCopyButton)}
				</InputContainer>

			</Container>
		);
	}
}
