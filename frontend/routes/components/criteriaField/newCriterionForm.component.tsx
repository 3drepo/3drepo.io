import * as React from 'react';
import { Form, Field, withFormik, connect } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';

import { TextField } from '../textField/textField.component';
import { SelectField, FormControl } from './criteriaField.styles';

interface IProps {
	criterion: any;
	onSubmit: (values) => void;
}

class NewCreaterionFormComponent extends React.PureComponent<IProps, any> {

	public componentDidMount() {}

	public render() {
		return (
			<Form>
				<FormControl>
					<InputLabel shrink>Field</InputLabel>
					<Field name="field" render={({ field, form }) => (
						<SelectField
							{...field}
						/>
					)} />
				</FormControl>

				<FormControl>
					<InputLabel shrink>Operation</InputLabel>
					<Field name="operator" render={({ field, form }) => (
						<SelectField
							{...field}
						/>
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
	enableReinitialize: true
	// validationSchema: GroupSchema
})(connect(NewCreaterionFormComponent as any)) as any;
