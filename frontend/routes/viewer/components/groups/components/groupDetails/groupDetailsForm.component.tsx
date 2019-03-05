import * as React from 'react';
import * as Yup from 'yup';
import * as dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { Field, Form, Formik, validateYupSchema, withFormik, connect } from 'formik';
import { Select } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { GROUPS_TYPES_LIST } from '../../../../../../constants/groups';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
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
	get isNewGroup() {
		return !this.props.group._id;
	}

	public componentDidMount() {
		this.props.setIsFormValid(this.isNewGroup);
	}

	public componentDidUpdate({group}) {
		const { color, description, objects, rules } = this.props.group;
		const colorChanged = color !== group.color;
		const descriptionChanged = description !== group.description;
		const objectsChanged = objects !== group.objects;
		const rulesChanged = rules !== group.rules;
		
		if (colorChanged || descriptionChanged || objectsChanged || rulesChanged) {
			this.props.setIsFormValid(this.isNewGroup);
		}
	}

	public handleFieldChange = (onChange, form) => (event) => {
		event.persist();
		const newValues = {
			...form.values,
			[event.target.name]: event.target.value
		};

		onChange(event);
		form.validateForm(newValues)
			.then(() => {
				const isDirty = !isEqual(newValues, form.initialValues);
				this.props.handleChange(event);
				this.props.setIsFormValid(isDirty);
			})
			.catch(() => {
				this.props.setIsFormValid(false);
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
				validateOnBlur={false}
				validateOnChange={false}
				validationSchema={GroupSchema}
				onSubmit={this.props.onSubmit}
			>
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
							<Field name="type" render={({ field, form }) => (
								<Select
									{...field}
									disabled={!this.props.canUpdate}
									onChange={this.handleFieldChange(field.onChange, form)}
								>
									{this.renderTypeSelectItems()}
								</Select>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<Field name="description" render={({ field, form }) => (
						<Description
							{...field}
							onChange={this.handleFieldChange(field.onChange, form)}
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
