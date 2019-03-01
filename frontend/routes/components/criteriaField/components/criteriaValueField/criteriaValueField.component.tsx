import * as React from 'react';

import {
	RangeInputs,
	MultipleInputs,
	RangeInput,
	AddButton,
	RemoveButton,
	MultipleInput,
	MultipleInputsContainer,
	NewMultipleInputWrapper
} from './criteriaValueField.styles';
import { ENTER_KEY } from '../../../../../constants/keys';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import Input from '@material-ui/core/Input';
import Hidden from '@material-ui/core/Hidden';
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { VALUE_FIELD_MAP, VALUE_FIELD_TYPES, CRITERIA_OPERATORS_TYPES } from '../../../../../constants/criteria';
import { InputLabel } from '@material-ui/core';
import { SmallIconButton } from '../../../smallIconButon/smallIconButton.component';

interface IProps {
	name: string;
	value: any[];
	selectedOperator: string;
	onChange: (event) => void;
	onBlur: (event) => void;
}

interface IState {
	value: any[];
}

export class CriteriaValueField extends React.PureComponent<IProps, IState> {
	public state = {
		value: []
	};

	public componentDidUpdate(prevProps) {
		const { selectedOperator, onChange, name } = this.props;

		if (selectedOperator !== prevProps.selectedOperator) {
			if (onChange) {
				onChange({ target: { value: [], name } });
				this.setState({ value: []	});
			}
		}
	}

	public handleSingleValueChange = ({ target: { value } }) => {
		const { onChange, name } = this.props;

		if (onChange) {
			onChange({ target: { value: [value], name } });
		}
	}

	public handleMultiValueChange = ({ target: { value: changedValue }}, index) => {
		const { onChange, name, value } = this.props;
		if (onChange) {
			const newValue = [...value];
			newValue[index] = Number(changedValue);
			onChange({ target: { value: newValue, name } });
			this.setState({ value: newValue });
		}
	}

	public addMultipleInput = () => {
		const { onChange, name, value } = this.props;
		if (onChange) {
			const newValue = [...value];
			newValue[newValue.length] = null;
			onChange({ target: { value: newValue, name } });
			this.setState({ value: newValue });
		}
	}

	public removeMultipleInput = (index) => {
		const { onChange, name, value } = this.props;
		if (onChange) {
			const newValue = [...value];
			newValue.splice(index, 1);
			onChange({ target: { value: newValue, name } });
			this.setState({ value: newValue });
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

	public renderMultipleInputs = renderWhenTrue(() => (
		<MultipleInputsContainer>
			<AddButton>
				<SmallIconButton
					tooltip={`Add new input`}
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

	public renderNewMultipleInput = (index) => {
		return (
			<NewMultipleInputWrapper key={index}>
				<MultipleInput
					type="number"
					value={this.state.value[index]}
					onChange={(event) => this.handleMultiValueChange(event, index)}
				/>
				<RemoveButton>
					<SmallIconButton
						tooltip={`Remove input`}
						onClick={() => this.removeMultipleInput(index)}
						Icon={RemoveIcon}
					/>
				</RemoveButton>
			</NewMultipleInputWrapper>
		);
	}

	public renderSingleInput = renderWhenTrue(() => (
		<Input
			value={this.props.value}
			onChange={this.handleSingleValueChange}
		/>
	));

	public renderRangeInputs = renderWhenTrue(() => (
		<RangeInputs>
			<RangeInput
				key="0"
				type="number"
				value={this.state.value[0]}
				onChange={(event) => this.handleMultiValueChange(event, 0)}
			/>
			<RangeInput
				key="1"
				type="number"
				value={this.state.value[1]}
				onChange={(event) => this.handleMultiValueChange(event, 1)}
			/>
		</RangeInputs>
	));

	public renderInitialState = renderWhenTrue(() => (
		<Input
			placeholder="Set value"
			disabled
		/>
	));

	public renderRegexInfo = renderWhenTrue(() =>
		<i>i</i>
	);

	public renderLabel = renderWhenTrue(() =>
		<InputLabel shrink>Value</InputLabel>
	);

	public render() {
		const { selectedOperator } = this.props;

		return [
			this.renderLabel(VALUE_FIELD_MAP[selectedOperator] !== VALUE_FIELD_TYPES.EMPTY),
			this.renderInitialState(!VALUE_FIELD_MAP[selectedOperator]),
			this.renderSingleInput(VALUE_FIELD_MAP[selectedOperator] === VALUE_FIELD_TYPES.SINGLE),
			this.renderMultipleInputs(VALUE_FIELD_MAP[selectedOperator] === VALUE_FIELD_TYPES.MULTIPLE),
			this.renderRangeInputs(VALUE_FIELD_MAP[selectedOperator] === VALUE_FIELD_TYPES.RANGE),
			this.renderRegexInfo(selectedOperator === CRITERIA_OPERATORS_TYPES.REGEX)
		];
	}
}
