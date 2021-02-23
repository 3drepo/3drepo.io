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
import Portal from '@material-ui/core/Portal';
import TextField from '@material-ui/core/TextField';
import Autosuggest from 'react-autosuggest';
import { usePopper } from 'react-popper';

import { Highlight } from '../../../../../components/highlight/highlight.component';
import { getSuggestions } from './autosuggestField.helpers';
import { Wrapper } from './autosuggestField.styles';

const renderInputComponent = (inputProps) => {
	const { classes, inputRef = () => {}, ref, ...other } = inputProps;

	return (
		<TextField
			fullWidth
			InputProps={{
				inputRef: (node) => {
					ref(node);
					inputRef(node);
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
	saveOnChange?: boolean;
}

export const AutoSuggestField: React.FunctionComponent<IProps> = ({
	label, placeholder, field, form, disabled, saveOnChange, suggestions: allSuggestions = []
}) => {
	const [suggestions, setSuggestions] = React.useState([]);
	const [value, setValue] = React.useState('');
	const [nodeRef, setNodeRef] = React.useState(null);
	const [popperElement, setPopperElement] = React.useState(null);
	const { styles, attributes } = usePopper(nodeRef, popperElement, { placement: 'top-start' });

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
		if (!saveOnChange) {
			form.setFieldValue(field.name, value);
		}
	};

	const handleChange = (event, { newValue }) => {
		setValue(newValue);
		if (saveOnChange) {
			form.setFieldValue(field.name, newValue);
		}
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
				inputRef: setNodeRef,
			}}
			renderSuggestionsContainer={(options) => (
				<Portal>
					<Wrapper
						ref={setPopperElement}
						style={styles.popper}
						{...attributes.popper}
					>
						<Paper
							square
							{...options.containerProps}
							style={{
								minWidth: nodeRef?.clientWidth,
							}}
						>
							{options.children}
						</Paper>
					</Wrapper>
				</Portal>
			)}
		/>
	);
};
