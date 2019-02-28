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
import { GROUPS_TYPES } from '../../../../../../constants/groups';
import { Select } from '@material-ui/core';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { ICriteriaFieldState } from '../../../../../../modules/groups/groups.redux';

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
	selectedType: string;
}

class GroupDetailsFormComponent extends React.PureComponent<IProps, IState> {
	public state = {
		isSaving: false,
		selectedType: GROUPS_TYPES.SMART
	};

	get isNewGroup() {
		return !this.props.group._id;
	}

	public componentDidMount() {
		if (this.props.group && this.props.group.rules && this.props.group.rules.length) {
			this.setState({
				selectedType: GROUPS_TYPES.SMART
			});
		}
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

	public handleFieldChange = (onChange) => (event) => {
		this.props.setState({
			newGroup: {
				...this.props.group,
				[event.target.name]: event.target.value
			}
		});

		onChange(event, event.target.value);
	}

	public renderRulesField = renderWhenTrue(
		<Field name="rules" render={({ field }) => (
			<CriteriaField
				{...field}
				{...this.props.critieriaFieldState}
				onChange={this.handleFieldChange(field.onChange)}
				setState={this.props.setCriteriaState}
				label="Criteria"
				placeholder="Select first criteria"
				disabled={!this.props.canUpdate}
				fieldNames={this.props.fieldNames}
			/>
		)}/>
	);

	public render() {
		const { group: { updatedAt }, groupColor, selectedNodes } = this.props;

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
						<Select disabled={!this.props.canUpdate} value={this.state.selectedType} onChange={(event) => {
							this.setState({
								selectedType: event.target.value
							});
						}}>
							<MenuItem key={GROUPS_TYPES.SMART} value={GROUPS_TYPES.SMART}>
								Criteria
							</MenuItem>
							<MenuItem key={GROUPS_TYPES.NORMAL} value={GROUPS_TYPES.NORMAL}>
								Normal</MenuItem>
						</Select>
					</StyledFormControl>
				</FieldsRow>
				<Field name="color" render={({ field }) => (
					<HiddenField {...field} value={groupColor} />
				)} />
				<Field name="selectedNodes" render={({ field }) => (
					<HiddenField {...field}	value={selectedNodes} />
				)} />
				<Field name="description" render={({ field }) => (
					<TextField
						{...field}
						validationSchema={GroupSchema}
						fullWidth
						multiline
						label="Description"
						onChange={this.handleFieldChange(field.onChange)}
						disabled={!this.props.canUpdate}
					/>
				)} />
				{this.renderRulesField(this.state.selectedType === GROUPS_TYPES.SMART)}
			</Form>
		);
	}
}

export const GroupDetailsForm = withFormik({
	mapPropsToValues: ({ group, selectedNodes }) => ({
		name: group.name,
		description: group.description || '',
		color: group.color,
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
