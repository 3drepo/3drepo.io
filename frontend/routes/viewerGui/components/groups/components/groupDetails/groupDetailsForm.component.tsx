import { Select } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { Field, Form, Formik } from 'formik';
import { isEqual } from 'lodash';
import React from 'react';
import * as Yup from 'yup';

import { GROUPS_TYPES, GROUPS_TYPES_LIST } from '../../../../../../constants/groups';
import { formatDateTime } from '../../../../../../services/formatting/formatDate';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { Description, FieldsRow, LongLabel, StyledFormControl, StyledTextField } from './groupDetails.styles';

const GroupSchema = Yup.object().shape({
	desc: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

interface IGroup {
	_id: string;
	updatedAt: number;
	type: string;
	desc: string;
	name: string;
	color: string;
	rules: any[];
	totalSavedMeshes: number;
	objects: object[];
}

interface IProps {
	group: IGroup;
	currentUser: any;
	totalMeshes: number;
	canUpdate: boolean;
	fieldNames: any[];
	selectedNodes: any[];
	onSubmit: () => void;
	handleChange: (event) => void;
	setIsFormValid: (isFormValid) => void;
	setIsFormDirty: (isFormDirty) => void;
}

export class GroupDetailsForm extends React.PureComponent<IProps, any> {
	get isNewGroup() {
		return !this.props.group._id;
	}

	public formikRef = React.createRef<HTMLElement>() as any;

	public componentDidMount() {
		this.props.setIsFormValid(this.isNewGroup);
	}

	public componentDidUpdate(prevProps) {
		const { name, desc, color, rules, type, objects } = this.props.group;
		const currentValues = { name, desc, color, rules, type };
		const initialValues = this.formikRef.current.initialValues;
		const groupChanged = !isEqual(this.props.group, prevProps.group);
		const isNormalGroup = this.props.group.type === GROUPS_TYPES.NORMAL;
		const sharedIdsChanged = isNormalGroup ? this.areSharedIdsChanged(this.props.selectedNodes, objects) : false;

		const isFormDirtyAndValid = (!isEqual(initialValues, currentValues) && groupChanged) || sharedIdsChanged;
		this.props.setIsFormValid(isFormDirtyAndValid);
		this.props.setIsFormDirty(isFormDirtyAndValid);
	}

	public areSharedIdsChanged = (selectedNodes = [], groupObjects = []) => {
		const toFullIdsDict = (dict, val) => {
			val.shared_ids.forEach((e) => dict[val.account + '.' + val.model + '.' + e] = true);
			return dict;
		};

		selectedNodes = selectedNodes.reduce(toFullIdsDict, {});
		groupObjects = groupObjects.reduce(toFullIdsDict, {});

		return !isEqual(selectedNodes, groupObjects);
	}

	public handleFieldChange = (onChange, form) => (event) => {
		event.persist();
		const newValues = {
			...form.values,
			[event.target.name]: event.target.value
		};

		onChange(event);
		const isDirty = !isEqual(newValues, form.initialValues);
		this.props.setIsFormDirty(isDirty);
		form.validateForm(newValues)
			.then(() => {
				this.props.handleChange(event);
				this.props.setIsFormValid(true);
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
		const {
			group: { updatedAt, type, desc, name, color, rules, totalSavedMeshes }
		} = this.props;
		const initialValues = { type, desc , name, color, rules };

		return (
			<Formik
				initialValues={initialValues}
				validateOnBlur={false}
				validateOnChange={false}
				validationSchema={GroupSchema}
				onSubmit={this.props.onSubmit}
				ref={this.formikRef}
			>
				<Form>
					<FieldsRow>
						<StyledTextField
							label={<LongLabel>Number of objects</LongLabel>}
							value={totalSavedMeshes || 0}
							disabled
						/>
						<StyledTextField
							label="Last updated"
							value={formatDateTime(updatedAt)}
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
					<Field name="desc" render={({ field, form }) => (
						<Description
							{...field}
							onChange={this.handleFieldChange(field.onChange, form)}
							validationSchema={GroupSchema}
							fullWidth
							multiline
							label="Description"
							error={Boolean(form.errors.desc)}
							helperText={form.errors.desc}
							disabled={!this.props.canUpdate}
							mutable={!this.isNewGroup}
							placeholder="(No description)"
						/>
					)} />
				</Form>
			</Formik>
		);
	}
}
