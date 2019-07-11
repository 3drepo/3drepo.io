import React from 'react';

import { ENTER_KEY } from '../../../../../constants/keys';
import { PasteButton, PasteContainer, PasteField, StyledCloseIcon, StyledSaveIcon } from './criteriaPasteField.styles';

interface IProps {
	name?: string;
	initialValue?: string;
	setState: (currentValue) => void;
	onChange: (pastedCriteria) => void;
	onCancel: () => void;
}

interface IState {
	currentValue: string;
	isValid: boolean;
}

const areValidCriteria = (value) => {
	if (!value) {
		return true;
	}

	try {
		const parsedCriteria = JSON.parse(value);
		return !parsedCriteria.some(({ field, operator }) => !field || !operator);
	} catch (error) {
		return false;
	}
};

export class CriteriaPasteField extends React.PureComponent<IProps, IState> {
	public state = {
		currentValue: '',
		isValid: true
	};

	public componentDidMount() {
		if (this.props.initialValue) {
			this.setState({
				currentValue: this.props.initialValue,
				isValid: areValidCriteria(this.props.initialValue)
			});
		}
	}

	public handlePaste = (data) => {
		const isValidValue = areValidCriteria(data);

		if (isValidValue) {
			const newSelectedCriteria = JSON.parse(data);
			this.props.onChange(newSelectedCriteria);
		}
	}

	public handleKeyboardPaste = (event) => {
		event.preventDefault();
		this.handlePaste(event.clipboardData.getData('text'));
	}

	public handlePasteSave = () => {
		this.handlePaste(this.state.currentValue);
	}

	public handleEnterPress = (event) => {
		if (event.key === ENTER_KEY) {
			this.handlePasteSave();
		}
	}

	public handleStateChange = (event) => {
		const isValidValue = areValidCriteria(event.target.value);

		if (this.props.setState) {
			this.setState({ currentValue: event.target.value, isValid: isValidValue}, () => {
				this.props.setState(this.state.currentValue);
			});
		}
	}

	public render() {
		const errorMessage = !this.state.isValid ? 'Unsupported filter format' : '';

		return (
			<PasteContainer>
				<PasteField
					value={this.props.initialValue}
					name={this.props.name}
					onChange={this.handleStateChange}
					onPaste={this.handleKeyboardPaste}
					onKeyPress={this.handleEnterPress}
					placeholder="Paste filters here"
					fullWidth
					autoFocus
					error={!this.state.isValid}
					helperText={errorMessage}
				/>
				<PasteButton
					disabled={!this.state.isValid || !this.state.currentValue.length}
					onClick={this.handlePasteSave}
					aria-label="Save pasted filters"
				>
					<StyledSaveIcon />
				</PasteButton>
				<PasteButton onClick={this.props.onCancel} aria-label="Close pasting">
					<StyledCloseIcon />
				</PasteButton>
			</PasteContainer>
		);
	}
}
