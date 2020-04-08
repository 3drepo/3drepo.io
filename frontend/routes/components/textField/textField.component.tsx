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

import React from 'react';

import { TextFieldProps } from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { Field, Formik } from 'formik';

import { renderWhenTrue } from '../../../helpers/rendering';
import { ExpandAction } from '../../viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import {
	ActionsLine,
	Container,
	FieldLabel,
	FieldWrapper,
	MutableActionsLine,
	StyledIconButton,
	StyledLinkableField,
	StyledTextField,
} from './textField.styles';

interface IProps extends TextFieldProps {
	className?: string;
	requiredConfirm?: boolean;
	validationSchema?: any;
	mutable?: boolean;
	onBeforeConfirmChange?: (event) => void;
	expandable?: boolean;
}

interface IState {
	initialValue: string;
	currentValue: string;
	edit: boolean;
	isExpanded: boolean;
	isLongContent: boolean;
}

const SmallButton = ({ onClick, children}) => (
	<StyledIconButton onClick={onClick}>{children}</StyledIconButton>
);

export class TextField extends React.PureComponent<IProps, IState> {
	public state = {
		initialValue: '',
		currentValue: '',
		edit: false,
		isExpanded: false,
		isLongContent: false,
	};

	private inputLocalRef = React.createRef();
	private linkableFieldRef = React.createRef();

	get isExpandable() {
		return this.props.expandable && this.state.isLongContent && !this.state.edit;
	}

	get isEditMode() {
		return (!this.props.mutable || this.state.edit) && !this.props.disabled;
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

	get linkableFieldElement() {
		return this.linkableFieldRef && this.linkableFieldRef.current as any;
	}

	get fieldValue() {
		return this.props.requiredConfirm ? this.state.currentValue : this.props.value;
	}

	private checkIfGotLongContent = () => {
		if (!this.props.expandable) {
			return null;
		}

		const { textRef } = this.linkableFieldElement;
		if (textRef) {
			const height = textRef.current.offsetHeight;

			if (height >= 48 && !this.state.isLongContent) {
				this.setState({ isLongContent: true });
			} else if (height < 48 && this.state.isLongContent) {
				this.setState({ isLongContent: false });
			}
		}
	}

	private handleOnExpand = () => this.setState({ isExpanded: !this.state.isExpanded });

	private renderExpandableText = renderWhenTrue(() => (
		<ExpandAction onClick={this.handleOnExpand} top>{this.state.isExpanded ? 'Less' : 'More'}</ExpandAction>
	));

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

		if (this.linkableFieldElement && !this.state.isLongContent) {
			setTimeout(() => {
				this.checkIfGotLongContent();
			});
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
		<MutableActionsLine>
			<SmallButton onClick={this.setEditable}>
				<EditIcon fontSize="small" />
			</SmallButton>
		</MutableActionsLine>
	)

	public onBlur = (e) => {
		const currentTarget = e.currentTarget;

		setTimeout(() => {
			if (!currentTarget.contains(document.activeElement)) {
				this.declineChange();
			}
		}, 0);
	}

	private additionalProps = () => {
		if (!this.state.isExpanded && this.isExpandable) {
			return {
				style: {
					height: '48px',
				}
			};
		}

		return {};
	}

	private handlePlaceholderClick = () => {
		if (this.isExpandable) {
			this.handleOnExpand();
		}
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
			mutable,
			...props
		} = this.props;
		const { initialValue } = this.state;
		const shouldRenderActions = this.hasValueChanged && this.isEditMode;
		const shouldRenderMutable = !this.isEditMode && !this.props.disabled;

		return (
				<>
					<Formik
							enableReinitialize
							initialValues={{ [name]: initialValue }}
							validationSchema={validationSchema}
							onSubmit={this.saveChange}
					>
						<Container onBlur={this.onBlur} className={className}>
							{this.isEditMode &&
							<Field name={name} render={({ field, form }) =>
								(
									<StyledTextField
										{...props}
										{...field}
										value={this.fieldValue}
										inputRef={this.textFieldRef}
										fullWidth
										onChange={this.onChange(field)}
										error={Boolean(form.errors[name] || props.error)}
										helperText={form.errors[name] || props.helperText}
									/>
								)}
							/>
							}
							{!this.isEditMode &&
							<FieldWrapper onClick={this.handlePlaceholderClick}>
								<FieldLabel shrink>{this.props.label}</FieldLabel>
								<StyledLinkableField ref={this.linkableFieldRef} {...this.additionalProps()}>
									{this.fieldValue}
								</StyledLinkableField>
							</FieldWrapper>
							}
							{shouldRenderActions && this.renderActionsLine()}
							{shouldRenderMutable && this.renderMutableButton()}
						</Container>
					</Formik>
					{this.renderExpandableText(this.isExpandable)}
				</>
		);
	}
}
