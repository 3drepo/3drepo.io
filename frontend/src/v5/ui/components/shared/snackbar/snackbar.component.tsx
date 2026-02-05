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
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ISnackConfig } from '@/v4/modules/snackbar/snackbar.redux';

export const SnackbarHandler = () => {
	const [isOpen, setIsOpen] = useState(true);
	const latestSnack = useSelector(selectSnackConfig);
	const [snack, setSnack] = useState<ISnackConfig>(latestSnack);
	const queue: ISnackConfig[] = [];

	const processQueue = () => {
		if (queue.length > 0) {
			setIsOpen(true);
			setSnack(queue.shift());
		}
	};

	const handleNewSnack = (newSnack) => {
		queue.push(newSnack);
		processQueue();
	};

	const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setIsOpen(false);
	};

	const handleExited = () => {
		processQueue();
	};

	useEffect(() => {
		if (!latestSnack?.key) return;
		handleNewSnack(latestSnack);
	}, [latestSnack]);

	return (
		<Snackbar
			autoHideDuration={snack?.timeout ?? 5000}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			onClose={handleClose}
			open={isOpen}
			{...snack}
			TransitionProps={{
				onExited: handleExited,
			}}
		>
			<SnackbarContent
				message={snack?.message}
				action={[
					<IconButton
						key="close"
						aria-label="Close"
						color="inherit"
						size="large"
						onClick={() => handleClose(null, '')}
					>
						<Close />
					</IconButton>,
				]}
			/>
		</Snackbar>
	);
};
