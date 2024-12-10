/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { createRef, PureComponent } from 'react';

import { StandardTextFieldProps } from '@mui/material/TextField';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import copy from 'copy-to-clipboard';
import { Field, Formik } from 'formik';

import CopyIcon from '@mui/icons-material/FileCopy';
import { ENTER_KEY } from '../../../constants/keys';
import { renderWhenTrue } from '../../../helpers/rendering';
import {
	ActionsLine,
	Container,
	CopyButton,
	FieldLabel,
	FieldWrapper,
	MutableActionsLine,
	StyledIconButton,
	StyledLinkableField,
	StyledMarkdownField,
	StyledTextField,
	ExpandAction,
} from './textField.styles';

interface IProps extends StandardTextFieldProps {
	className?: string;
	requiredConfirm?: boolean;
	validationSchema?: any;
	mutable?: boolean;
	onBeforeConfirmChange?: (event) => void;
	expandable?: boolean;
	disableShowDefaultUnderline?: boolean;
	enableMarkdown?: boolean;
	forceEdit?: boolean;
	withCopyButton?: boolean;
	onCancel?: () => void;
	showSnackbar?: (text: string) => void;
	value?: string;
}

interface IState {
	initialValue: string;
	currentValue: string;
	edit: boolean;
	isExpanded: boolean;
	isLongContent: boolean;
	hasError: boolean;
}

const SmallButton = ({ onClick, children}) => (
	<StyledIconButton onClick={onClick}>{children}</StyledIconButton>
);

export class TextField extends PureComponent<IProps, IState> {
	public state = {
		initialValue: '',
		currentValue: '',
		edit: false,
		isExpanded: false,
		isLongContent: false,
		hasError: false,
	};

	private inputLocalRef = createRef();
	private markdownFieldRef = createRef<HTMLSpanElement>();

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

	get markdownFieldElement() {
		return this.markdownFieldRef && this.markdownFieldRef.current as any;
	}

	get fieldValue() {
		return this.props.requiredConfirm ? this.state.currentValue : this.props.value;
	}

	private checkIfGotLongContent = () => {
		if (!this.props.expandable) {
			return null;
		}

		const { textRef } = this.markdownFieldElement;
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
		const { value, requiredConfirm, forceEdit } = this.props;
		if (requiredConfirm && value) {
			this.setState({ initialValue: value, currentValue: value } as IState);
		}

		if (forceEdit) {
			this.setEditable();
		}
	}

	public componentDidUpdate(prevProps, prevState) {
		const { value, requiredConfirm } = this.props;
		if (requiredConfirm && value !== prevProps.value) {
			this.setState({ initialValue: value, currentValue: value, edit: false } as IState);
		}

		if (this.markdownFieldElement && !this.state.isLongContent) {
			setTimeout(() => {
				this.checkIfGotLongContent();
			});
		}

		if (prevState.edit === false && this.state.edit) {
			this.inputElement.select();
		}
	}

	public onChange = (field) => (event) => {
		const { requiredConfirm, onChange, onBeforeConfirmChange } = this.props;

		if (requiredConfirm) {
			this.setState({ currentValue: event.target.value });

			if (onBeforeConfirmChange) {
				onBeforeConfirmChange(event);
			}
		} else if (onChange) {
			onChange(event);
		}

		field.onChange(event);
	}

	public handleEnterPress = (event) => {
		if (event.key === ENTER_KEY) {
			this.saveChange();
		}
	}

	public saveChange = () => {
		if (this.state.hasError) {
			return;
		}

		if ((this.props.onChange && this.hasValueChanged) || this.props.forceEdit) {
			this.props.onChange({ target: this.inputElement } as any);
		} else {
			this.declineChange();
		}
	}

	public setEditable = () => {
		this.setState({ edit: true });
	}

	public declineChange = () => {
		this.setState((prevState) => ({ currentValue: prevState.initialValue, edit: false }));
		if (this.props.onCancel) {
			this.props.onCancel();
		}
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

	private handleCopyButtonClick = () => {
		copy(this.fieldValue);
		this.props.showSnackbar('Value copied to the clipboard');
	}

	public renderCopyButton = () => (
		<CopyButton icon={CopyIcon} onClick={this.handleCopyButtonClick}>
			Copy
		</CopyButton>
	)

	private renderTextField = ({ field, form }) => {
		const {
			onBeforeConfirmChange,
			requiredConfirm,
			value,
			onChange,
			validationSchema,
			name,
			className,
			mutable,
			disableShowDefaultUnderline,
			enableMarkdown,
			forceEdit,
			...props
		} = this.props;

		const onLoad = () => this.setState({ hasError: Boolean(form.errors[name]) });

		return (
			<StyledTextField
				{...props}
				{...field}
				onLoad={onLoad}
				value={this.fieldValue}
				inputRef={this.textFieldRef}
				fullWidth
				onChange={this.onChange(field)}
				onKeyPress={this.handleEnterPress}
				error={Boolean(form.errors[name] || props.error)}
				helperText={form.errors[name] || props.helperText}
			/>
		);
	}

	public onBlur = (e) => {
		const currentTarget = e.currentTarget;
		if (!this.props.forceEdit) {
			setTimeout(() => {
				if (!currentTarget.contains(document.activeElement)) {
					this.declineChange();
					this.props.onBlur?.(e);
				}
			}, 0);
		}
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
			validationSchema,
			name,
			className,
			mutable,
			disableShowDefaultUnderline,
			enableMarkdown,
			placeholder,
		} = this.props;
		const { initialValue } = this.state;
		const shouldRenderActions = mutable && this.isEditMode;
		const shouldRenderMutable = !this.isEditMode && !this.props.disabled;
		const shouldRenderCopyButton = this.props.withCopyButton && !mutable;

		return (
			<>
				<Formik
					enableReinitialize
					initialValues={{ [name]: initialValue }}
					validationSchema={validationSchema}
					onSubmit={this.saveChange}
				>
					<Container onBlur={this.onBlur} className={className} editMode={this.isEditMode}>
						{this.isEditMode && <Field name={name} render={this.renderTextField} />}
						{!this.isEditMode &&
						<FieldWrapper line={Number(!disableShowDefaultUnderline)} onClick={this.handlePlaceholderClick}>
							<FieldLabel shrink>{this.props.label}</FieldLabel>
							{enableMarkdown &&
							<StyledMarkdownField
								ref={this.markdownFieldRef}
								$isPlaceholder={!this.fieldValue}
								{...this.additionalProps()}
							>
								{this.fieldValue || placeholder}
							</StyledMarkdownField>
							}
							{!enableMarkdown &&
							<StyledLinkableField ref={this.markdownFieldRef}>
								{this.fieldValue}
							</StyledLinkableField>
							}
						</FieldWrapper>
						}
						{shouldRenderActions && this.renderActionsLine()}
						{shouldRenderMutable && this.renderMutableButton()}
						{shouldRenderCopyButton && this.renderCopyButton()}
					</Container>
				</Formik>
				{this.renderExpandableText(this.isExpandable)}
			</>
		);
	}
}
