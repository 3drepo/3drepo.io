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

import { MenuItem, Paper } from '@material-ui/core';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import { Highlight } from '../highlight/highlight.component';

import { Container, StyledTextField, SuggestionsList } from './autosuggestField.styles';

interface IProps {
	suggestions: any[];
	label: string;
	value: string;
	name: string;
	placeholder?: string;
	onChange: (event) => void;
	onBlur: (event) => void;
}

interface IState {
	suggestions: any[];
	value: any;
}

const getSuggestionValue = (suggestion) => suggestion;

export class AutosuggestField extends React.PureComponent<IProps, IState> {
	public state = {
		suggestions: [],
		value: ''
	};

	private popperNode = null;

	public componentDidMount() {
		this.setState({
			value: this.props.value,
			suggestions: this.props.suggestions
		});
	}

	public componentDidUpdate(prevProps) {
		if (this.props.value !== prevProps.value) {
			this.setState({ value: this.props.value });
		}
	}

	public getSuggestions = (value) => {
		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;

		return inputLength === 0 ? [] : this.props.suggestions.filter((suggestion) =>
			suggestion.toLowerCase().slice(0, inputLength) === inputValue
		);
	}

	public onSuggestionsFetchRequested = ({ value }) => {
		const suggestions = this.getSuggestions(value);
		const isCurrentValueTheSameAsSuggestion = (suggestions.length === 1) && (suggestions[0] === this.state.value);

		if (!isCurrentValueTheSameAsSuggestion) {
			this.setState({
				suggestions: this.getSuggestions(value)
			});
		}
	}

	public onSuggestionsClearRequested = () => {
		this.setState({ suggestions: [] });
	}

	public renderSuggestion = (suggestion, { isHighlighted, query }) => (
		<MenuItem selected={isHighlighted} component="div">
			<Highlight text={suggestion} search={query} />
		</MenuItem>
	)

	public renderSuggestionsContainer = (options) => (
		<SuggestionsList
			anchorEl={this.popperNode}
			open={Boolean(options.children)}
			placement="bottom"
		>
			<Paper
				square
				{...options.containerProps}
				style={{ width: this.popperNode ? this.popperNode.clientWidth : null }}
			>
				{options.children}
			</Paper>
		</SuggestionsList>
	)

	public renderInputComponent = (inputProps) => {
		const { inputRef, ref, ...other } = inputProps;

		return (
			<StyledTextField
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

	private handleValueUpdate = () => {
		if (this.props.onChange) {
			this.props.onChange({
				target: { value: this.state.value, name: this.props.name }
			});
		}
	}

	public onSearchChange = (event, { newValue }) => {
		this.setState({ value: newValue }, this.handleValueUpdate);
	}

	public onSuggestionSelected: any = (event, { suggestion }) => {
		event.preventDefault();
		this.setState({ value: suggestion }, this.handleValueUpdate);
	}

	public render() {
		const { value, suggestions } = this.state;
		const { name, placeholder } = this.props;

		return (
			<Container>
				<Autosuggest
					ref={this.handleAutoSuggestMount}
					suggestions={suggestions}
					onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
					onSuggestionsClearRequested={this.onSuggestionsClearRequested}
					getSuggestionValue={getSuggestionValue}
					renderSuggestion={this.renderSuggestion}
					renderInputComponent={this.renderInputComponent}
					inputProps={{
						value,
						name,
						placeholder,
						onChange: this.onSearchChange,
						inputRef: (node) => {
							this.popperNode = node;
						}
					}}
					renderSuggestionsContainer={this.renderSuggestionsContainer}
					onSuggestionSelected={this.onSuggestionSelected}
				/>
			</Container>
		);
	}
}
