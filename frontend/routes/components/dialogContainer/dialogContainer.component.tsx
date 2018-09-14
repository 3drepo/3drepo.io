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
import { dispatch } from '../../../helpers/migration';
import { invoke } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { theme } from '../../../styles';
import { Container } from './dialogContainer.styles';
import { RemoveUserDialog } from './components/removeUserDialog/removeUserDialog.component';
import { ErrorDialog } from './components/errorDialog/errorDialog.component';

interface IProps {
	config: any;
	data?: any;
	isOpen: boolean;
	hide: () => void;
}

const DIALOG_TEMPLATES = {
	confirmUserRemove: RemoveUserDialog,
	error: ErrorDialog
};

export class DialogContainer extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		isOpen: false
	};

	public handleClose = () => {
		this.props.hide();

		if (this.props.config.onCancel) {
			dispatch(this.props.config.onCancel());
		}
	}

	public handleResolve = () => {
		this.props.hide();

		if (this.props.config.onConfirm) {
			dispatch(this.props.config.onConfirm());
		}
	}

	public render() {
		const { content, title, isOpen, templateType } = this.props.config;
		const data = this.props.data || {};

		const DialogTemplate = DIALOG_TEMPLATES[templateType];

		return (
			<MuiThemeProvider theme={theme}>
				<Dialog
					open={this.props.isOpen}
					onClose={this.handleClose}>
					{title && <DialogTitle>{title}</DialogTitle>}
					{
						content && !DialogTemplate && (
							<DialogContent>
								<div dangerouslySetInnerHTML={{ __html: content }}></div>
							</DialogContent>
						)
					}
					{
						DialogTemplate && (
							<DialogTemplate
								{...data}
								handleResolve={this.handleResolve}
								handleClose={this.handleClose}
							/>
						)
					}
				</Dialog>
			</MuiThemeProvider>
		);
	}
}
