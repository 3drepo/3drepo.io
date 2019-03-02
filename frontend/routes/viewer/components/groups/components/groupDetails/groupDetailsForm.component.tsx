import * as React from 'react';
import * as Yup from 'yup';
import * as dayjs from 'dayjs';
import { connect, Field, Form, withFormik } from 'formik';
import { Select } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { GROUPS_TYPES, GROUPS_TYPES_LIST } from '../../../../../../constants/groups';
import { ICriteriaFieldState } from '../../../../../../modules/groups/groups.redux';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { FieldsRow, StyledFormControl, StyledTextField, Description, LongLabel } from './groupDetails.styles';
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
	selectedNodes: any[];
	fieldNames: any[];
	critieriaFieldState: ICriteriaFieldState;
	onSubmit: (values) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
	setState: (componentState) => void;
	setCriteriaState: (criteriaState) => void;
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

	public handleFieldChange = (onChange) => (event) => {
		this.props.setState({
			newGroup: {
				...this.props.group,
				[event.target.name]: event.target.value
			}
		});
		onChange(event);
	}

	public renderTypeSelectItems = () => {
		return GROUPS_TYPES_LIST.map(({ label, type }) => (
			<MenuItem key={type} value={type}>{label}</MenuItem>
		));
	}

	public render() {
		const { group: { updateDate }, selectedNodes } = this.props;
		return (
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
								disabled={!this.props.canUpdate}
								onChange={this.handleFieldChange(field.onChange)}
							>
								{this.renderTypeSelectItems()}
							</Select>
						)} />
					</StyledFormControl>
				</FieldsRow>
				<Field name="color" render={({ field }) => (
					<HiddenField {...field} />
				)} />
				<Field name="selectedNodes" render={({ field }) => (
					<HiddenField {...field}	value={selectedNodes} />
				)} />
				<Field name="description" render={({ field }) => (
					<Description
						{...field}
						onChange={this.handleFieldChange(field.onChange)}
						validationSchema={GroupSchema}
						fullWidth
						multiline
						label="Description"
						disabled={!this.props.canUpdate}
					/>
				)} />
			</Form>
		);
	}
}

export const GroupDetailsForm = withFormik({
	mapPropsToValues: ({ group, selectedNodes }) => ({
		name: group.name,
		description: group.description || '',
		color: group.color,
		type: group.type,
		rules: group.rules || [],
		selectedNodes
	}),
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: GroupSchema,
	displayName: 'GroupForm'
})(connect(GroupDetailsFormComponent as any)) as any;
