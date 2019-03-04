import * as React from 'react';
import * as Yup from 'yup';
import * as dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { Select } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { GROUPS_TYPES_LIST } from '../../../../../../constants/groups';
import { VALIDATIONS_MESSAGES, getValidationErrors } from '../../../../../../services/validation';
import { FieldsRow, StyledFormControl, StyledTextField, Description, LongLabel } from './groupDetails.styles';

const GroupSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

interface IProps {
	group: any;
	currentUser: any;
	totalMeshes: number;
	canUpdate: boolean;
	fieldNames: any[];
	onSubmit: () => void;
	handleChange: (event) => void;
	setIsFormValid: (isFormValid) => void;
}

export class GroupDetailsForm extends React.PureComponent<IProps, any> {
	public async componentDidMount() {
		await this.handleValidation(this.props.group);
	}

	get isNewGroup() {
		return !this.props.group._id;
	}

	public handleFieldChange = (onChange) => (event) => {
		this.props.handleChange(event);
		onChange(event);
	}

	public handleValidation = (values) => {
		return getValidationErrors(GroupSchema, values)
			.then(() => {
				this.props.setIsFormValid(true);
				return {};
			})
			.catch((errors) => {
				this.props.setIsFormValid(false);
				return errors;
			});
	}

	public renderTypeSelectItems = () => {
		return GROUPS_TYPES_LIST.map(({ label, type }) => (
			<MenuItem key={type} value={type}>{label}</MenuItem>
		));
	}

	public render() {
		const { group: { updateDate, type, description } } = this.props;
		const initialValues = { type, description };

		return (
			<Formik
				initialValues={initialValues}
				validationSchema={GroupSchema}
				validate={this.handleValidation}
				onSubmit={this.props.onSubmit}>
				<Form>
					<FieldsRow>
						<StyledTextField
							label={<LongLabel>Number of objects</LongLabel>}
							value={this.props.totalMeshes}
							disabled
						/>
						<StyledTextField
							label="Last update"
							value={dayjs(updateDate).format('DD MMM')}
							disabled
						/>
						<StyledFormControl>
							<InputLabel>Group type</InputLabel>
							<Field name="type" render={({ field }) => (
								<Select
									{...field}
									value={type}
									disabled={!this.props.canUpdate}
									onChange={this.handleFieldChange(field.onChange)}
								>
									{this.renderTypeSelectItems()}
								</Select>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<Field name="description" render={({ field, form }) => (
						<Description
							{...field}
							value={description}
							onChange={this.handleFieldChange(field.onChange)}
							validationSchema={GroupSchema}
							fullWidth
							multiline
							label="Description"
							error={Boolean(form.errors.description)}
							helperText={form.errors.description}
							disabled={!this.props.canUpdate}
						/>
					)} />
				</Form>
			</Formik>
		);
	}
}
