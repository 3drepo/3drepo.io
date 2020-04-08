/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Autosuggest from 'react-autosuggest';

import {Highlight} from '../../../../../components/highlight/highlight.component';
import { getSuggestions } from './autosuggestField.helpers';
import { StyledPopper } from './autosuggestField.styles';

const renderInputComponent = (inputProps) => {
	const { classes, inputRef = () => {}, ref, ...other } = inputProps;

	return (
		<TextField
			fullWidth
			InputProps={{
				inputRef: (node) => {
					ref(node);
					inputRef.current = node;
				},
			}}
			{...other}
		/>
	);
};

const getSuggestionValue = (suggestion) => suggestion;

interface IItem {
	suggestion: string;
	searchText: string;
}

export const Item = ({ suggestion, searchText }: IItem) => (
	<Highlight
		search={searchText || ''}
		text={suggestion}
	/>
);

interface IProps {
	label: string;
	placeholder?: string;
	field: any;
	form: any;
	suggestions: any[];
	disabled?: boolean;
}

export const AutoSuggestField: React.FunctionComponent<IProps> = ({
	label, placeholder, field, form, disabled, suggestions: allSuggestions = []
}) => {
	const [suggestions, setSuggestions] = React.useState([]);
	const [value, setValue] = React.useState('');
	const nodeRef = React.useRef(null);

	React.useEffect(() => {
		setValue(field.value);
	}, [field.value]);

	const renderSuggestion = (suggestion, {query, isHighlighted}) => {
		return (
			<MenuItem selected={isHighlighted} component="div">
				<Item suggestion={suggestion} searchText={query} />
			</MenuItem>
		);
	};

	const handleSuggestionsFetchRequested = (props) => {
		setSuggestions(getSuggestions(props.value, allSuggestions));
	};

	const handleSuggestionsClearRequested = () => setSuggestions([]);

	const handleBlur = () => {
		form.setFieldValue(field.name, value);
	};

	const handleChange = (event, { newValue }) => {
		setValue(newValue);
	};

	const autosuggestProps = {
		renderInputComponent,
		suggestions,
		onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
		onSuggestionsClearRequested: handleSuggestionsClearRequested,
		getSuggestionValue,
		renderSuggestion,
		shouldRenderSuggestions: () => true,
	};

	return (
		<Autosuggest
			{...autosuggestProps}
			inputProps={{
				label,
				placeholder,
				disabled,
				value,
				onChange: handleChange,
				onBlur: handleBlur,
				inputRef: nodeRef,
			}}
			renderSuggestionsContainer={(options) => (
				<StyledPopper
					anchorEl={nodeRef.current}
					open={Boolean(options.children)}
					placement="bottom-start"
				>
					<Paper
						square
						{...options.containerProps}
						style={{ minWidth: nodeRef.current ? nodeRef.current.clientWidth : null }}
					>
						{options.children}
					</Paper>
				</StyledPopper>
			)}
		/>
	);
};
