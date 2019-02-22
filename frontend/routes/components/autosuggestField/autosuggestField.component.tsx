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
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';

import { Container, SuggestionsList, StyledTextField } from './autosuggestField.styles';

interface IProps {
	suggestions: any[];
	label: string;
	value: string;
	name: string;
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

	public getSuggestions = (value) => {
		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;

		return inputLength === 0 ? [] : this.props.suggestions.filter((suggestion) =>
			suggestion.toLowerCase().slice(0, inputLength) === inputValue
		);
	}

	public onSuggestionsFetchRequested = ({ value }) => {
		this.setState({
			suggestions: this.getSuggestions(value)
		});
	}

	public onSuggestionsClearRequested = () => {
		this.setState({ suggestions: [] });
	}

	public handleChange = (event, { newValue }) => {
		if (this.props.onChange) {
			this.props.onChange({
				target: { value: newValue, name: this.props.name }
			});
		}
		this.setState({ value: newValue });
	}

	public renderSuggestion = (suggestion, { isHighlighted }) => (
		<MenuItem selected={isHighlighted} component="div">
			{suggestion}
		</MenuItem>
	)

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

	public render() {
		const { value, suggestions } = this.state;
		const { label, onBlur, name } = this.props;

		return (
			<Container>
				<Autosuggest
					suggestions={suggestions}
					onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
					onSuggestionsClearRequested={this.onSuggestionsClearRequested}
					getSuggestionValue={getSuggestionValue}
					renderSuggestion={this.renderSuggestion}
					renderInputComponent={this.renderInputComponent}
					inputProps={{
						label,
						value,
						name,
						onBlur,
						onChange: this.handleChange,
						inputRef: (node) => {
							this.popperNode = node;
						}
					}}
					renderSuggestionsContainer={this.renderSuggestionsContainer}
				/>
			</Container>
		);
	}
}
