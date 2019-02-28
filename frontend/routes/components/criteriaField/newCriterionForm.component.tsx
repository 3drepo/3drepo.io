import * as React from 'react';
import * as Yup from 'yup';

import { Form, Field, withFormik, connect } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { SelectField as CustomSelectField } from '../../components/selectField/selectField.component';
import { TextField } from '../textField/textField.component';
import { SelectField, FormControl, NewCriterionFooter, OperatorSubheader } from './criteriaField.styles';
import { SubmitButton } from '../submitButton/submitButton.component';
import { CriteriaValueField } from './components/criteriaValueField/criteriaValueField.components';
import { CRITERIA_LIST } from '../../../constants/criteria';
import { AutosuggestField } from '../autosuggestField/autosuggestField.component';

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
	values: Yup.array()
});

interface IProps {
	values: any;
	criterion: any;
	fieldNames: any[];
	formik: any;
	setState: (criterionForm) => void;
	onSubmit: (values) => void;
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
		const { values } = this.props.formik;
		console.log('formik', values)
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

				<Field name="values" render={({ field }) => (
					<FormControl>
						<InputLabel shrink>Value</InputLabel>
						<CriteriaValueField 
							{...field}
							value={field.value}
						/>
					</FormControl>
				)} />

				<NewCriterionFooter>
					<Field render={({ form }) => (
						<SubmitButton disabled={!form.isValid || form.isValidating}>Confirm</SubmitButton>
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
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: CriterionSchema
})(connect(NewCreaterionFormComponent as any)) as any;
