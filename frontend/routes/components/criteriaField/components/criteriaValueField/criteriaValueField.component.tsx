import React from 'react';

import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import {
	AddButton,
	InputWrapper,
	MultipleInput,
	MultipleInputs,
	MultipleInputsContainer,
	NewMultipleInputWrapper,
	RangeInput,
	RangeInputs,
	RemoveButton,
	SingleInput
} from './criteriaValueField.styles';

import { InputLabel } from '@material-ui/core';
import {
	VALUE_FIELD_MAP,
	VALUE_FIELD_TYPES
} from '../../../../../constants/criteria';
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { SmallIconButton } from '../../../smallIconButon/smallIconButton.component';

interface IProps {
	name: string;
	value: any[];
	selectedOperator: string;
	selectedId: string;
	error: boolean;
	helperText: any[];
	touched: any[];
	setTouched: (touched) => void;
	onChange: (event) => void;
	onBlur: (event) => void;
}

interface IState {
	value: any[];
}

const INITIAL_VALUE = {
	[VALUE_FIELD_TYPES.RANGE]: ['', ''],
	[VALUE_FIELD_TYPES.SINGLE]: [''],
	[VALUE_FIELD_TYPES.MULTIPLE]: [''],
	[VALUE_FIELD_TYPES.EMPTY]: ['']
};

export class CriteriaValueField extends React.PureComponent<IProps, IState> {
	public state = {
		value: []
	};

	public renderMultipleInputs = renderWhenTrue(() => (
		<MultipleInputsContainer>
			<AddButton>
				<SmallIconButton
					tooltip="Add value"
					onClick={this.addMultipleInput}
					Icon={AddIcon}
					disabled={!Boolean(this.state.value.length)}
				/>
			</AddButton>
			<MultipleInputs>
				{this.renderNewMultipleInputs()}
			</MultipleInputs>
		</MultipleInputsContainer>
	));

	public renderSingleInput = renderWhenTrue(() => (
		<InputWrapper>
			<SingleInput
				value={this.props.value}
				onChange={this.handleSingleValueChange}
				helperText={this.props.touched[0] && this.getHelperText(0)}
				error={this.props.touched[0] && this.props.error}
			/>
		</InputWrapper>
	));

	public renderRangeInputs = renderWhenTrue(() => {
		return (
			<RangeInputs>
				<RangeInput
					value={this.state.value[0]}
					onChange={(event) => this.handleMultiValueChange(event, 0)}
					helperText={this.props.touched[0] && this.getHelperText(0)}
					error={this.props.touched[0] && this.getHelperText(0)}
				/>
				<RangeInput
					value={this.state.value[1]}
					onChange={(event) => this.handleMultiValueChange(event, 1)}
					helperText={this.props.touched[1] && this.getHelperText(1)}
					error={this.props.touched[1] && this.getHelperText(1)}
				/>
			</RangeInputs>
		);
	});

	public renderInitialState = renderWhenTrue(() => (
		<>
			<InputLabel shrink>Value</InputLabel>
			<SingleInput
				placeholder="Set value"
				fullWidth
				disabled
			/>
		</>
	));

	public renderLabel = renderWhenTrue(() =>
		<InputLabel shrink>Value</InputLabel>
	);

	public getHelperText = (index) => {
		if (this.props.helperText && this.props.helperText.length) {
			if (typeof this.props.helperText !== 'string')  {
				return this.props.helperText[index];
			} else {
				return this.props.helperText;
			}
		}
		return null;
	}

	public componentDidUpdate(prevProps) {
		const { selectedOperator, selectedId, onChange, name, value } = this.props;
		const operatorChanged = selectedOperator !== prevProps.selectedOperator;
		const idChanged = selectedId !== prevProps.selectedId;
		const hasSwitchedToNextCriterion = selectedId && idChanged;
		const changes = {} as any;

		if (operatorChanged || idChanged) {
			if (hasSwitchedToNextCriterion) {
				changes.value = value;
			} else {
				const operator = VALUE_FIELD_MAP[selectedOperator];
				const initialValue = operator && operator.fieldType ? INITIAL_VALUE[operator.fieldType] : [];
				changes.value = initialValue;
			}
			this.setState(changes, () => {
				this.props.setTouched({ values: Array.from({length: changes.value.length}, () => false) });
				onChange({ target: { value: changes.value, name } });
			});
		}
	}

	public handleSingleValueChange = ({ target: { value } }) => {
		this.props.setTouched({ values: [true] });
		const { onChange, name } = this.props;

		if (onChange) {
			onChange({ target: { value: [value], name } });
		}
	}

	public handleMultiValueChange = (event, index) => {
		const { target: { value: changedValue }} = event;
		const { onChange, name, value } = this.props;
		const newValue = [...value];
		newValue[index] = changedValue;

		onChange({ target: { value: newValue, name } });

		this.setState({ value: newValue }, () => {
			const touchedValues = this.props.touched;
			touchedValues[index] = true;
			this.props.setTouched({ values: touchedValues });
		});
	}

	public addMultipleInput = () => {
		const { onChange, name, value } = this.props;
		if (onChange) {
			const newValue = [...value];
			newValue[newValue.length] = '';
			onChange({ target: { value: newValue, name } });
			this.setState({ value: newValue }, () => {
				const touchedValues = this.props.touched;
				touchedValues[this.props.value.length + 1] = false;
				this.props.setTouched({ values: touchedValues });
			});
		}
	}

	public removeMultipleInput = (index) => {
		const { onChange, name, value } = this.props;
		if (onChange) {
			const newValue = [...value];
			newValue.splice(index, 1);

			if (newValue.length === 0 ) {
				newValue.push('');
			}

			onChange({ target: { value: newValue, name } });
			this.setState({ value: newValue }, () => {
				const touchedValues = this.props.touched;
				touchedValues[index] = false;
				this.props.setTouched({ values: touchedValues });
			});
		}
	}

	public renderNewMultipleInputs = () => {
		const Inputs = [];
		Inputs.push(this.renderNewMultipleInput(0));

		this.state.value.map((val, index) => {
			if (index > 0) {
				Inputs.push(this.renderNewMultipleInput(index));
			}
		});

		return Inputs;
	}

	public renderNewMultipleInput = (index) => {
		const helperText = this.props.touched[index] && this.getHelperText(index);
		return (
			<NewMultipleInputWrapper key={index}>
				<MultipleInput
					value={this.state.value[index]}
					onChange={(event) => this.handleMultiValueChange(event, index)}
					helperText={helperText}
					error={Boolean(helperText)}
				/>
				<RemoveButton>
					<SmallIconButton
						tooltip="Remove value"
						onClick={() => this.removeMultipleInput(index)}
						Icon={RemoveIcon}
					/>
				</RemoveButton>
			</NewMultipleInputWrapper>
		);
	}

	public render() {
		const { selectedOperator } = this.props;

		return (
			<>
				{this.renderInitialState(!VALUE_FIELD_MAP[selectedOperator])}
				{this.renderLabel(
					VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType !== VALUE_FIELD_TYPES.EMPTY
				)}
				{this.renderSingleInput(
					VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType === VALUE_FIELD_TYPES.SINGLE
				)}
				{this.renderMultipleInputs(
					VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType === VALUE_FIELD_TYPES.MULTIPLE
				)}
				{this.renderRangeInputs(
					VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType === VALUE_FIELD_TYPES.RANGE
				)}
			</>
		);
	}
}
