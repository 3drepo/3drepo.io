/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { Button } from '@controls/button';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { Typography } from '@controls/typography';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

export const ModalsDemo = () => {
	const { register, handleSubmit } = useForm();
	const dispatch = useDispatch();
	const [openState, setOpen] = useState(false);

	const showAlertModal = () => {
		const action = DialogsActions.open('alert', {
			currentActions: '{current actions}',
			error: {
				message: '<Error message from the network request>',
				response: {
					status: 404,
					statusText: '<http status and error code>',
				},
			},
			details: '<Detail where the user will be taken by clicking ‘OK, close window’>',
		});
		dispatch(action);
	};

	const showFormModal = () => {
		setOpen(true);
	};

	const onSubmit = () => {
		setOpen(false);
	};

	const onClickClose = () => setOpen(false);

	return (
		<>
			<Typography variant="h1">Modals demo page</Typography>
			<Button variant="contained" color="primary" onClick={showAlertModal}>Show alert modal</Button>
			<Button variant="contained" color="primary" onClick={showFormModal}>Show form modal</Button>
			<FormModal open={openState} onSubmit={handleSubmit(onSubmit)} onClickClose={onClickClose} confirmLabel="Save profile" title="Update profile">
				<input {...register('firstName')} placeholder="First name" />
			</FormModal>
		</>
	);
};
