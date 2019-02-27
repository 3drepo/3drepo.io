import * as React from 'react';
import * as Yup from 'yup';
import * as dayjs from 'dayjs';

import { debounce } from 'lodash';
import { connect, Field, Form, withFormik } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { TextField } from '../../../../../components/textField/textField.component';
import { FieldsRow, StyledFormControl, StyledTextField } from './groupDetails.styles';
import { SelectField } from '../../../../../components/selectField/selectField.component';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { CriteriaField } from '../../../../../components/criteriaField/criteriaField.component';
import { HiddenField } from './hiddenField.component';

const GroupSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	color: Yup.array()
});

interface IProps {
	group: any;
	values: any;
	formik: any;
	currentUser: any;
	newColor: string;
	totalMeshes: number;
	canUpdate: boolean;
	groupColor: any[];
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
	setState: (componentState) => void;
	setIsFormValid: (isFormValid) => void;
}

interface IState {
	isSaving: boolean;
}

class GroupDetailsFormComponent extends React.PureComponent<IProps, IState> {
	public state = {
		isSaving: false
	};

	get isNewGroup() {
		return !this.props.group._id;
	}

	public componentDidUpdate(prevProps) {
		const isFormValid = this.props.formik.isValid && !this.props.formik.isValidating;
		const prevIsFormValid = prevProps.formik.isValid && !prevProps.formik.isValidating;

		if (!this.isNewGroup && isFormValid !== prevIsFormValid) {
			this.props.setIsFormValid(isFormValid);
		}
	}

	public autoSave = debounce(() => {
		const { formik, handleSubmit } = this.props;
		if (!formik.isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			this.props.formik.setFieldValue();
			handleSubmit();
			this.setState({ isSaving: false });
		});
	}, 200);

	public handleChangeAndSubmit = (event) => {
		event.persist();
		this.props.handleChange(event);
		this.props.handleSubmit();
	}

	public handleDescriptionChange = (onChange) => (event) => {
		this.props.setState({
			newGroup: {
				...this.props.group,
				description: event.target.value
			}
		});

		onChange(event, event.target.value);
	}

	public render() {
		const { group: { updatedAt }, groupColor } = this.props;

		return (
			<Form>
				<FieldsRow>
					<StyledTextField
						label="Number of objects"
						value={this.props.totalMeshes}
						disabled
					/>
					<StyledTextField
						label="Last update"
						value={dayjs(updatedAt).format('DD MMM')}
						disabled
					/>
					<StyledFormControl>
						<InputLabel>Group type</InputLabel>
						<Field name="type" render={({ field }) => (
							<SelectField {...field} disabled={!this.props.canUpdate}>
								<MenuItem key={'smart'} value={'smart'}>Criteria</MenuItem>
								<MenuItem key={'normal'} value={'normal'}>Normal</MenuItem>
							</SelectField>
						)} />
					</StyledFormControl>
				</FieldsRow>
				<Field name="color" render={({ field }) => (
					<HiddenField
						{...field}
						value={groupColor}
					/>
				)} />
				<Field name="description" render={({ field }) => (
					<TextField
						{...field}
						validationSchema={GroupSchema}
						fullWidth
						multiline
						label="Description"
						onChange={this.handleDescriptionChange(field.onChange)}
						disabled={!this.props.canUpdate}
					/>
				)} />
				<Field name="rules" render={({ field }) => (
					<CriteriaField
						{...field}
						label="Criteria"
						placeholder="Select first criteria"
						disabled={!this.props.canUpdate}
					/>
				)}/>
			</Form>
		);
	}
}

export const GroupDetailsForm = withFormik({
	mapPropsToValues: ({ group }) => ({
		name: group.name,
		description: group.description || '',
		color: group.color,
		rules: group.rules || []
	}),
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: GroupSchema,
	displayName: 'GroupForm'
})(connect(GroupDetailsFormComponent as any)) as any;
