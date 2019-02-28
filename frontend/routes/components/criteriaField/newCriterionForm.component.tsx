import * as React from 'react';
import * as Yup from 'yup';

import { Form, Field, withFormik, connect } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import ListSubheader from '@material-ui/core/ListSubheader';
import { SelectField as CustomSelectField } from '../../components/selectField/selectField.component';

import { TextField } from '../textField/textField.component';
import {
	SelectField,
	FormControl,
	NewCriterionFooter,
	CriteriaList,
	CriterionType,
	Operators,
	SearchField,
	StyledTextField
} from './criteriaField.styles';
import { SubmitButton } from '../submitButton/submitButton.component';
import { CRITERIA_LIST } from '../../../constants/criteria';
import { VALIDATIONS_MESSAGES } from '../../../services/validation';
import { compareStrings } from '../../../helpers/searching';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const PaperPropsStyle = {
	maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
	width: 250,
	transform: 'translate3d(0, 0, 0)'
};

const CriterionSchema = Yup.object().shape({
	field: Yup.string().required(),
	operation: Yup.string().required()
});

interface IProps {
	criterion: any;
	fieldNames: any[];
	onSubmit: (values) => void;
}

class NewCreaterionFormComponent extends React.PureComponent<IProps, any> {
	public state = {
		fieldNames: []
	};

	public componentDidMount() {
		this.setState({
			fieldNames: this.props.fieldNames
		});
	}

	public renderOperator = ({ operator, label }) => (
		<MenuItem key={operator} value={operator}>
			{label}
		</MenuItem>
	)

	public renderOperators = () => (
		<CriteriaList subheader={<li />}>
			{CRITERIA_LIST.map(({ name, operators }) => (
				<CriterionType key={name}>
					<Operators>
						<ListSubheader>{name}</ListSubheader>
						{operators.map(this.renderOperator)}
					</Operators>
				</CriterionType>
			))}
		</CriteriaList>
	)
	public handleSearchFieldChange = (event) => {
		const query = event.target.value.trim().toLowerCase();
		this.setState({
			fieldNames: this.props.fieldNames.filter((name) => compareStrings(name, query))
		});
	}

	public renderFieldNames = () =>
		this.state.fieldNames.map((name) => (
			<MenuItem key={name} value={name}>{name}</MenuItem>
		)
	)

	public render() {
		return (
			<Form>
				<FormControl>
					<InputLabel shrink>Field</InputLabel>
					<Field name="field" render={({ field, form }) => (
						<>
							<CustomSelectField
								{...field}
								MenuProps={{ PaperProps: { style: PaperPropsStyle } }}
							>
								<SearchField>
									<StyledTextField
										autoFocus
										placeholder="Search field"
										onChange={this.handleSearchFieldChange}
									/>
								</SearchField>
								{this.renderFieldNames()}
							</CustomSelectField>
						</>
					)} />
				</FormControl>

				<FormControl>
					<InputLabel shrink>Operation</InputLabel>
					<Field name="operator" render={({ field, form }) => (
						<SelectField {...field}>
							{this.renderOperators()}
						</SelectField>
					)} />
				</FormControl>

				<Field name="value" render={({ field }) => (
					<TextField
						{...field}
						label="Value"
						placeholder="Set value"
						fullWidth
						InputLabelProps={{
							shrink: true
						}}
					/>
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
		value: criterion.value
	}),
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: CriterionSchema
})(connect(NewCreaterionFormComponent as any)) as any;
