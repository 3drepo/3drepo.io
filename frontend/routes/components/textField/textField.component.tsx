/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { TextFieldProps } from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';

import { Container, ActionsLine, StyledIconButton, StyledTextField } from './textField.styles';
import { Formik, Field } from 'formik';
import { LinkableField } from '../linkableField/linkableField.component';

interface IProps {
	className?: string;
	requiredConfirm?: boolean;
	validationSchema?: any;
	mutable?: boolean;
	onBeforeConfirmChange?: (event) => void;
}

interface IState {
	initialValue: string;
	currentValue: string;
	edit: boolean;
}

const SmallButton = ({ onClick, children}) => (
	<StyledIconButton onClick={onClick}>{children}</StyledIconButton>
);

export class TextField extends React.PureComponent<TextFieldProps & IProps, IState> {
	public state = {
		initialValue: '',
		currentValue: '',
		edit: false
	};

	private inputLocalRef = React.createRef();

	get isEditMode() {
		return !this.props.mutable || this.state.edit;
	}

	get hasValueChanged() {
		return this.state.initialValue !== this.state.currentValue;
	}

	get textFieldRef() {
		return (this.props.inputRef || this.inputLocalRef) as any;
	}

	get inputElement() {
		return this.textFieldRef.current;
	}

	public componentDidMount() {
		const { value, requiredConfirm } = this.props;
		if (requiredConfirm && value) {
			this.setState({ initialValue: value, currentValue: value } as IState);
		}
	}

	public componentDidUpdate(prevProps) {
		const { value, requiredConfirm } = this.props;
		if (requiredConfirm && value !== prevProps.value) {
			this.setState({ initialValue: value, currentValue: value, edit: false } as IState);
		}
	}

	public onChange = (field) => (event) => {
		const { requiredConfirm, onChange, onBeforeConfirmChange } = this.props;

		if (requiredConfirm) {
			this.setState({ currentValue: event.target.value });
			field.onChange(event);

			if (onBeforeConfirmChange) {
				onBeforeConfirmChange(event);
			}
		} else if (onChange) {
			onChange(event);
		}
	}

	public saveChange = () => {
		if (this.props.onChange) {
			this.props.onChange({ target: this.inputElement } as any);
		}
	}

	public setEditable = () => {
		this.setState({ edit: true });
	}

	public declineChange = () => {
		this.setState((prevState) => ({ currentValue: prevState.initialValue, edit: false }));
	}

	public renderActionsLine = () => (
		<ActionsLine>
			<SmallButton onClick={this.declineChange}>
				<CancelIcon fontSize="small" />
			</SmallButton>
			<SmallButton onClick={this.saveChange}>
				<SaveIcon fontSize="small" />
			</SmallButton>
		</ActionsLine>
	)

	public renderMutableButton = () => (
		<ActionsLine>
			<SmallButton onClick={this.setEditable}>
				<EditIcon fontSize="small" />
			</SmallButton>
		</ActionsLine>
	)

	public onBlur = (e) => {
		const currentTarget = e.currentTarget;

		setTimeout(() => {
			if (!currentTarget.contains(document.activeElement)) {
				this.declineChange();
			}
		}, 0);
	}

	public render() {
		const {
			onBeforeConfirmChange,
			requiredConfirm,
			value,
			onChange,
			validationSchema,
			name,
			className,
			...props
		} = this.props;
		const { initialValue, currentValue } = this.state;
		const shouldRenderActions = this.hasValueChanged && this.isEditMode;

		return (
			<Formik
				enableReinitialize
				initialValues={{ [name]: initialValue }}
				validationSchema={validationSchema}
				onSubmit={this.saveChange}
			>
				<Container onBlur={this.onBlur} className={className}>
					{this.isEditMode &&
						<Field name={name} render={({ field, form }) => {
							const fieldValue = requiredConfirm ? currentValue : value;

							return (
								<StyledTextField
									{...props}
									{...field}
									value={fieldValue}
									inputRef={this.textFieldRef}
									fullWidth
									onChange={this.onChange(field)}
									error={Boolean(form.errors[name] || props.error)}
									helperText={form.errors[name] || props.helperText}
									autoFocus={true}
								/>
							);
						}} />
					}
					{!this.isEditMode &&
						<LinkableField>{this.state.currentValue}</LinkableField>
					}
					{shouldRenderActions && this.renderActionsLine()}
					{!this.isEditMode && this.renderMutableButton()}
				</Container>
			</Formik>
		);
	}
}
