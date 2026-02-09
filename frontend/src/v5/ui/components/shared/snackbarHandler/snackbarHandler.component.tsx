/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { selectSnackConfig } from '@/v4/modules/snackbar';
import { Close } from '@mui/icons-material';
import { IconButton, Snackbar, SnackbarContent } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ISnackConfig } from '@/v4/modules/snackbar/snackbar.redux';
import { SnackbarSpinner } from './snackbarHandler.styles';

export const SnackbarHandler = () => {
	const [isOpen, setIsOpen] = useState(false);

	const latestSnack = useSelector(selectSnackConfig);
	const [snack, setSnack] = useState<ISnackConfig>(latestSnack);
	const queue = useRef<ISnackConfig[]>([]);

	const autoHideDuration = !snack?.spinner ? (snack?.timeout ?? 5000) : undefined; // if snack has spinner, it should not autohide

	const processQueue = () => {
		if (queue.current.length > 0) {
			setIsOpen(true);
			setSnack(queue.current.shift());
		}
	};

	const handleNewSnack = (newSnack: ISnackConfig) => {
		// if new snack has the same key as the current one,
		// update the current snack instead of adding to the queue
		if (newSnack.key === snack.key) {
			setSnack(newSnack);
			return;
		}
		queue.current.push(newSnack);
		if (queue.current.length === 1 && !isOpen) {
			processQueue();
		}
	};

	const handleClose = (e, reason?: string) => {
		if (reason === 'clickaway') return;
		setIsOpen(false);
	};

	const action = snack.spinner
		? <SnackbarSpinner />
		: (
			<IconButton
				key="close"
				aria-label="Close"
				color="inherit"
				size="large"
				onClick={() => handleClose(null, '')}
			>
				<Close />
			</IconButton>
		);

	useEffect(() => {
		if (!latestSnack?.key) return;
		handleNewSnack(latestSnack);
	}, [latestSnack]);

	return (
		<Snackbar
			autoHideDuration={autoHideDuration}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			onClose={handleClose}
			open={isOpen}
			{...snack}
			TransitionProps={{
				onExited: processQueue,
			}}
		>
			<SnackbarContent
				message={<span>{snack?.message}</span>}
				action={[action]}
			/>
		</Snackbar>
	);
};
