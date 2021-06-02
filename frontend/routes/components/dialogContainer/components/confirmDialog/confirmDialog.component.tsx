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

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import React from 'react';

interface IProps {
	content?: string;
	handleResolve: () => void;
	handleClose: () => void;
}

export const ConfirmDialog = (props: IProps) => {
	const { content } = props;
	return (
		<>
			{ content && (
				<DialogContent>
					<div dangerouslySetInnerHTML={{ __html: content }} />
				</DialogContent>
			) }

			<DialogActions>
				<Button onClick={props.handleClose} color="secondary">No</Button>
				<Button onClick={props.handleResolve} variant="contained" color="secondary">Yes</Button>
			</DialogActions>
		</>
	);
};
