import * as React from 'react';

import {
	RangeInputs,
	MultipleInputs,
	RangeInput,
	SingleInput,
	AddButton,
	RemoveButton,
	MultipleInput,
	MultipleInputsContainer,
	NewMultipleInputWrapper,
	RegexInfoLink,
	InputWrapper
} from './criteriaValueField.styles';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import {
	VALUE_FIELD_MAP, VALUE_FIELD_TYPES, CRITERIA_OPERATORS_TYPES, REGEX_INFO_URL
} from '../../../../../constants/criteria';
import { InputLabel } from '@material-ui/core';
import { SmallIconButton } from '../../../smallIconButon/smallIconButton.component';

interface IProps {
	name: string;
	value: any[];
	selectedOperator: string;
	error: boolean;
	helperText: any[];
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

	public getHelperText = (index) => {
		if (this.props.helperText && this.props.helperText.length) {
			return this.props.helperText[index];
		}
		return null;
	}

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

	public handleMultiValueChange = (event, index) => {
		const { target: { value: changedValue }} = event;

		const { onChange, name, value } = this.props;
		if (onChange) {
			const newValue = [...value];
			newValue[index] = changedValue;
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

	public renderNewMultipleInput = (index) => {
		return (
			<NewMultipleInputWrapper key={index}>
				<MultipleInput
					value={this.state.value[index]}
					onChange={(event) => this.handleMultiValueChange(event, index)}
					helperText={this.getHelperText(index)}
					error={this.props.error}
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

	public renderSingleInput = renderWhenTrue(() => (
		<InputWrapper>
			<SingleInput
				value={this.props.value}
				onChange={this.handleSingleValueChange}
				helperText={this.getHelperText(0)}
				error={this.props.error}
			/>
		</InputWrapper>
	));

	public renderRangeInputs = renderWhenTrue(() => (
		<RangeInputs>
			<RangeInput
				key="0"
				value={this.state.value[0]}
				onChange={(event) => this.handleMultiValueChange(event, 0)}
				helperText={this.getHelperText(0)}
				error={this.props.error}
			/>
			<RangeInput
				key="1"
				value={this.state.value[1]}
				onChange={(event) => this.handleMultiValueChange(event, 1)}
				helperText={this.getHelperText(1)}
				error={this.props.error}
			/>
		</RangeInputs>
	));

	public renderInitialState = renderWhenTrue(() => (
		<SingleInput
			placeholder="Set value"
			fullWidth
			disabled
		/>
	));

	public renderRegexInfo = renderWhenTrue(() => (
		<RegexInfoLink href={REGEX_INFO_URL} target="_blank">
			<InfoIcon color="secondary" />
		</RegexInfoLink>
	));

	public renderLabel = renderWhenTrue(() =>
		<InputLabel shrink>Value</InputLabel>
	);

	public render() {
		const { selectedOperator } = this.props;

		return [
			this.renderInitialState(!VALUE_FIELD_MAP[selectedOperator]),
			this.renderLabel(
				VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType !== VALUE_FIELD_TYPES.EMPTY
			),
			this.renderSingleInput(
				VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType === VALUE_FIELD_TYPES.SINGLE
			),
			this.renderMultipleInputs(
				VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType === VALUE_FIELD_TYPES.MULTIPLE
			),
			this.renderRangeInputs(
				VALUE_FIELD_MAP[selectedOperator] && VALUE_FIELD_MAP[selectedOperator].fieldType === VALUE_FIELD_TYPES.RANGE
			),
			this.renderRegexInfo(selectedOperator === CRITERIA_OPERATORS_TYPES.REGEX)
		];
	}
}
