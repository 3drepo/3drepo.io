import * as React from 'react';
import * as Yup from 'yup';

import { Form, Field, withFormik, connect } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

import { SelectField, FormControl, NewCriterionFooter, OperatorSubheader } from './criteriaField.styles';
import { CriteriaValueField } from './components/criteriaValueField/criteriaValueField.component';
import {
	CRITERIA_LIST, VALUE_FIELD_MAP, VALUE_DATA_TYPES, VALUE_FIELD_TYPES
} from '../../../constants/criteria';
import { AutosuggestField } from '../autosuggestField/autosuggestField.component';
import { schema } from '../../../services/validation';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const PaperPropsStyle = {
	maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
	width: 250,
	transform: 'translate3d(0, 0, 0)'
};

const CriterionSchema = Yup.object().shape({
	field: Yup.string().required(),
	operator: Yup.string().required(),
	values: Yup.array().when('operator', {
		is: (value) => VALUE_FIELD_MAP[value].dataType === VALUE_DATA_TYPES.NUMBER,
		then: Yup.array().of(schema.measureNumberDecimal.nullable()).required('This field is required'),
		otherwise: Yup.array().of(Yup.string()).when('operator', {
			is: (value) => VALUE_FIELD_MAP[value].fieldType !== VALUE_FIELD_TYPES.EMPTY,
			then: Yup.array().required,
			otherwise: Yup.array()
		})
	})
});

interface IProps {
	values: any;
	criterion: any;
	fieldNames: any[];
	formik: any;
	setState: (criterionForm) => void;
	onSubmit: (values) => void;
	handleSubmit: () => void;
}

class NewCreaterionFormComponent extends React.PureComponent<IProps, any> {
	public renderOperator = ({ operator, label }) => (
		<MenuItem key={operator} value={operator}>
			{label}
		</MenuItem>
	)

	public renderOperators = () =>
		CRITERIA_LIST.map(({ name, operators }) => [
				(<OperatorSubheader>{name}</OperatorSubheader>),
				operators.map(this.renderOperator)
			]
		)

	public componentWillUnmount() {
		this.props.setState(this.props.values);
	}

	public render() {
		const { operator: selectedOperator } = this.props.formik.values;
		console.log('formik', this.props.formik);

		return (
			<Form>
				<FormControl>
					<InputLabel shrink>Field</InputLabel>
					<Field name="field" render={({ field }) => (
						<AutosuggestField
							{...field}
							suggestions={this.props.fieldNames}
						/>
					)} />
				</FormControl>

				<FormControl>
					<InputLabel shrink>Operation</InputLabel>
					<Field name="operator" render={({ field }) => (
						<SelectField
							{...field}
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
							error={Boolean(form.errors.values)}
							helperText={form.errors.values}
						/>
					</FormControl>
				)} />

				<NewCriterionFooter>
					<Field render={({ form }) => (
						<Button
							type="button"
							variant="raised"
							color="secondary"
							onClick={this.props.handleSubmit}
							disabled={!form.isValid || form.isValidating}
						>
							Confirm
						</Button>
					)} />
				</NewCriterionFooter>
			</Form>
		);
	}
}

export const NewCriterionForm = withFormik({
	mapPropsToValues: ({ criterion }) => ({
		field: criterion.field,
		operator: criterion.operator,
		values: criterion.values
	}),
	handleSubmit: (values, { props, resetForm }) => {
		(props as IProps).onSubmit(values);
		resetForm();
	},
	enableReinitialize: true,
	validationSchema: (props) => CriterionSchema
})(connect(NewCreaterionFormComponent as any)) as any;
