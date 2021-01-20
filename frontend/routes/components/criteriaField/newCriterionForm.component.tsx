import { get } from 'lodash';
import React from 'react';
import * as Yup from 'yup';

import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { connect, withFormik, Field, Form } from 'formik';

import {
	CRITERIA_LIST,
	CRITERIA_OPERATORS_LABELS,
	CRITERIA_OPERATORS_TYPES,
	REGEX_INFO_TEXT,
	REGEX_INFO_URL,
	VALUE_DATA_TYPES,
	VALUE_FIELD_MAP
} from '../../../constants/criteria';
import { renderWhenTrue } from '../../../helpers/rendering';
import { schema, VALIDATIONS_MESSAGES } from '../../../services/validation';
import { AutosuggestField } from '../autosuggestField/autosuggestField.component';
import { CriteriaValueField } from './components/criteriaValueField/criteriaValueField.component';
import { RegexInfoLink } from './components/criteriaValueField/criteriaValueField.styles';
import {
	CustomError,
	FormControl,
	NewCriterionFooter,
	OperatorSubheader,
	SelectField,
	SelectFieldValue
} from './criteriaField.styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const PaperPropsStyle = {
	maxHeight: ITEM_HEIGHT * 8.5 + ITEM_PADDING_TOP,
	width: 250,
	transform: 'translate3d(0, 0, 0)'
};

const CriterionSchema = Yup.object().shape({
	field: Yup.string().required(),
	operator: Yup.string().required(),
	values: Yup.array().when('operator', (operator, arraySchema) => {
		const dataType = get(VALUE_FIELD_MAP[operator], 'dataType');

		if (!dataType) {
			return arraySchema;
		}

		if (dataType === VALUE_DATA_TYPES.NUMBER) {
			return Yup.array().of(schema.measureNumberDecimal.nullable()).required(VALIDATIONS_MESSAGES.REQUIRED);
		}

		return arraySchema.of(Yup.string().required(VALIDATIONS_MESSAGES.REQUIRED));
	})
});

interface IProps {
	values: any;
	criterion: any;
	fieldNames: any[];
	formik: any;
	alreadySelectedFilters: any[];
	selectedCriterion: string;
	setState: (criterionForm) => void;
	onSubmit: (values) => void;
	handleSubmit: () => void;
}

interface IState {
	filterAlreadyExistsError: boolean;
}

class NewCreaterionFormComponent extends React.PureComponent<IProps, IState> {
	public state = {
		filterAlreadyExistsError: false
	};

	public renderRegexInfo = renderWhenTrue(() => (
		<RegexInfoLink href={REGEX_INFO_URL} target="_blank">
			<Tooltip title={REGEX_INFO_TEXT} placement="right"><InfoIcon color="secondary" /></Tooltip>
		</RegexInfoLink>
	));

	public componentDidUpdate(prevProps, prevState) {
		const { field, operator } = this.props.formik.values;
		const fieldChanged = field !== prevProps.formik.values.field;
		const operatorChanged = operator !== prevProps.formik.values.operator;

		if (field && operator && (fieldChanged || operatorChanged)) {
			const filterAlreadyExists =
				this.props.alreadySelectedFilters.find(
					(filter) => filter.field === field && filter.operator === operator && this.props.selectedCriterion !== filter._id
				);

			if (filterAlreadyExists) {
				this.setState({ filterAlreadyExistsError: true });
			}
			if (!filterAlreadyExists && prevState.filterAlreadyExistsError) {
				this.setState({ filterAlreadyExistsError: false });
			}
		}
	}

	public componentWillUnmount() {
		this.props.setState(this.props.values);
	}

	public renderOperator = ({ operator = '', label, disabled = false }) => (
		<MenuItem key={operator} value={operator} disabled={disabled}>
			{label}
		</MenuItem>
	)

	public renderOperators = () => {
		const operatorsItems = CRITERIA_LIST.map(({ name, operators }) => [
				(<OperatorSubheader>{name}</OperatorSubheader>),
				operators.map(this.renderOperator)
			]
		);

		return [
			this.renderOperator({ label: 'Set operation', disabled: true }),
			...operatorsItems
		];
	}

	public renderSelectedOperator = (operator) => (
		<SelectFieldValue placeholder={Number(!operator)}>
			{CRITERIA_OPERATORS_LABELS[operator] || 'Set operation'}
		</SelectFieldValue>
	)

	public render() {
		const { operator: selectedOperator, _id: selectedId } = this.props.formik.values;

		return (
			<Form>
				<FormControl>
					<InputLabel shrink>Field</InputLabel>
					<Field name="field" render={({ field }) => (
						<AutosuggestField
							{...field}
							placeholder="Set field"
							suggestions={this.props.fieldNames}
						/>
					)} />
				</FormControl>

				<FormControl>
					<InputLabel shrink>Operation</InputLabel>
					<Field name="operator" render={({ field }) => (
						<SelectField
							{...field}
							renderValue={this.renderSelectedOperator}
							displayEmpty
							MenuProps={{ PaperProps: { style: PaperPropsStyle } }}
						>
							{this.renderOperators()}
						</SelectField>
					)} />
				</FormControl>

				<Field name="values" render={({ field, form }) => (
					<FormControl>
						<CriteriaValueField
							{...field}
							value={field.value}
							selectedOperator={selectedOperator}
							selectedId={selectedId}
							error={Boolean(form.errors.values)}
							helperText={form.errors.values}
							touched={form.touched.values || []}
							setTouched={form.setTouched}
						/>
					</FormControl>
				)} />

				<NewCriterionFooter spaced={selectedOperator === CRITERIA_OPERATORS_TYPES.REGEX}>
					{this.renderRegexInfo(selectedOperator === CRITERIA_OPERATORS_TYPES.REGEX)}
					<Field render={({ form }) => (
						<Button
							type="button"
							variant="contained"
							color="secondary"
							onClick={this.props.handleSubmit}
							disabled={!form.isValid || form.isValidating || this.state.filterAlreadyExistsError}
						>
							{this.props.criterion._id ? 'Update' : 'Add'}
						</Button>
					)} />
				</NewCriterionFooter>
				{this.state.filterAlreadyExistsError && <CustomError>Filter with this operation is already used</CustomError>}
			</Form>
		);
	}
}

export const NewCriterionForm = withFormik({
	mapPropsToValues: ({ criterion }) => ({
		field: criterion.field,
		operator: criterion.operator,
		values: criterion.values,
		_id: criterion._id
	}),
	handleSubmit: (values, { props, resetForm }) => {
		(props as IProps).onSubmit(values);
		resetForm();
	},
	enableReinitialize: true,
	validationSchema: CriterionSchema
})(connect(NewCreaterionFormComponent as any)) as any;
