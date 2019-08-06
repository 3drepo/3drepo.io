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

import { Button } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { renderWhenTrue } from '../../../helpers/rendering';
import { dispatch } from '../../../modules/store';
import { DialogActions } from './dialogContainer.styles';

interface IProps {
	config: any;
	data?: any;
	isOpen: boolean;
	hide: () => void;
}

export class DialogContainer extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		isOpen: false
	};

	public renderContent = renderWhenTrue(() => (
		<DialogContent>
			<div dangerouslySetInnerHTML={{ __html: this.props.config.content }} />
		</DialogContent>
	));

	public renderTemplate = renderWhenTrue(() => {
		const { content, template: DialogTemplate } = this.props.config;
		const data = {
			content,
			...(this.props.data || {})
		};

		return (
			<DialogTemplate
				{...data}
				handleResolve={this.handleResolve}
				handleClose={this.handleClose}
			/>
		);
	});

	public renderActions = renderWhenTrue(() => (
		<DialogActions>
			<Button
				onClick={this.handleClose}
				variant={this.props.config.buttonVariant || 'text'}
				color="secondary">
					{this.props.config.closeText || 'Ok'}
			</Button>
		</DialogActions>
	));

	public componentDidUpdate(prevProps) {
		if (this.props.config && this.props.config.logError && !prevProps.config.logError) {
			console.error(this.props.config.logError, this.props.config.content);
		}
	}

	public handleCallback = (callback) => {
		const action = callback();

		if (action && !action.then) {
			dispatch(action);
		}
	}

	public handleClose = (...args) => {
		this.props.hide();

		if (this.props.config.onCancel) {
			this.handleCallback(this.props.config.onCancel.bind(null, ...args));
		}
	}

	public handleResolve = (...args) => {
		this.props.hide();

		if (this.props.config.onConfirm) {
			this.handleCallback(this.props.config.onConfirm.bind(null, ...args));
		}
	}

	public render() {
		const { content, title, template, DialogProps, onCancel } = this.props.config;

		return (
			<Dialog {...DialogProps} open={this.props.isOpen} onClose={this.handleClose}>
				{title && <DialogTitle disableTypography>{title}</DialogTitle>}
				{this.renderContent(content && !template)}
				{this.renderTemplate(template)}
				{this.renderActions(content && onCancel)}
			</Dialog>
		);
	}
}
