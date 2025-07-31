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

import { useEffect, useState, FunctionComponent, Ref } from 'react';

import Button from '@mui/material/Button';
import DialogBase from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { V4DialogsAdapter } from '@/v5/ui/v4Adapter/dialogs/v4DialogsAdapter.component';

import { RouteComponentProps } from 'react-router';
import { dispatch } from '@/v5/helpers/redux.helpers';
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { IDialogConfig } from '../../../../../modules/dialog/dialog.redux';
import { COLOR } from '../../../../../styles';
import { SearchButton } from '../../../../viewerGui/components/panelBarActions/searchButton';
import { DialogActions, DialogTitle, TopDialogActions } from './dialog.styles';

interface IProps extends RouteComponentProps<any> {
	id: number;
	config: IDialogConfig;
	data?: any;
	hide: (dialogId) => void;
	searchEnabled?: boolean;
	ref?: any;
}

export const Dialog: FunctionComponent<IProps> = ({ ref, ...props }: IProps) => {
	const [isOpen, setIsOpen] = useState(true);
	const [closeDisabled, setCloseDisabled] = useState(false);

	useEffect(() => {
		if (props.config && props.config.logError) {
			console.error(props.config.logError, props.config.content);
		}
	}, []);

	const { content, title, template: DialogTemplate, DialogProps, onCancel, search } = props.config;

	const renderContent = renderWhenTrue(() => (
		<DialogContent>
			<div dangerouslySetInnerHTML={{ __html: props.config.content }} />
		</DialogContent>
	));

	const renderTemplate = renderWhenTrue(() => {
		const data = { content, ...(props.data || {})};

		return (
			<DialogTemplate
				{...data}
				handleResolve={handleResolve}
				handleClose={handleClose}
				dialogId={props.id}
				handleDisableClose={handleCloseDisable}
				disableClosed={closeDisabled}
			/>
		);
	});

	const renderCloseButton = () => (
		<TopDialogActions>
			{search && <SearchButton
				enabled={props.searchEnabled}
				onOpen={search.onOpen}
				onClose={search.onClose}
			/>}
			<IconButton onClick={handleClose} size="large">
				{/* @ts-expect-error */}
				<CloseIcon htmlColor={COLOR.WHITE} />
			</IconButton>
		</TopDialogActions>
	);

	const renderActions = renderWhenTrue(() => (
		<DialogActions>
			<Button
				onClick={handleClose}
				variant={props.config.buttonVariant || 'text'}
				color="secondary">
					{props.config.closeText || 'Ok'}
			</Button>
		</DialogActions>
	));

	const handleCloseDisable = (set: boolean) => setCloseDisabled(set);

	const handleCallback = (callback) => {
		const action = callback();

		if (action && !action.then) {
			dispatch(action);
		}
	};

	const handleHide = () => {
		setTimeout(() => {
			props.hide(props.id);
		}, 200);
	};

	const handleClose = (...args) => {
		if (!closeDisabled) {
			setIsOpen(false);

			handleHide();

			if (props.config.onCancel) {
				handleCallback(props.config.onCancel.bind(null, ...args));
			}

		}
	};

	const handleResolve = (...args) => {
		handleHide();
		setIsOpen(false);

		if (props.config.onConfirm) {
			handleCallback(props.config.onConfirm.bind(null, ...args));
		}
	};

	return (
		<V4DialogsAdapter>
			<DialogBase {...DialogProps} ref={ref} open={isOpen} onClose={handleClose}>
					<DialogTitle>{title}{renderCloseButton()}</DialogTitle>
					{renderContent(content && !DialogTemplate)}
					{renderTemplate(!!DialogTemplate)}
					{renderActions(content && onCancel && !props.config.onConfirm)}
			</DialogBase>
		</V4DialogsAdapter>
    );
};
