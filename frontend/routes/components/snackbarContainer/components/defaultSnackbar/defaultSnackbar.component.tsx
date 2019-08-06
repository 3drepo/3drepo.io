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

import IconButton from '@material-ui/core/IconButton';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Close from '@material-ui/icons/Close';
import React from 'react';

interface IProps {
	message: string;
	onClose: (event, reason?) => void;
}

export const DefaultSnackbar = (props: IProps) => {
	return (
		<SnackbarContent
			message={props.message}
			action={ [
				<IconButton
					key="close"
					aria-label="Close"
					color="inherit"
					onClick={props.onClose}
				>
					<Close />
				</IconButton>
			] }
		/>
	);
};
