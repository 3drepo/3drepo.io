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

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import React from 'react';

import { Container, Link } from './newTermsDialog.styles';

interface IProps {
	handleResolve: () => void;
	handleClose: () => void;
}

export const NewTermsDialog = (props: IProps) => (
	<Container>
		<DialogContent>
			By continuing to use our service, you agree to accept the changes to our
			<Link href="terms" target="_blank">terms of use</Link>
			and acknowledge the changes to our
			<Link href="privacy" target="_blank">privacy policy</Link>.

			<p>
				If you have any questions about these updated versions, please contact us at
				<Link href="mailto:support@3drepo.org">support@3drepo.org</Link>
			</p>
		</DialogContent>
		<DialogActions>
			<Button onClick={props.handleResolve} variant="contained" color="secondary">ok</Button>
		</DialogActions>
	</Container>
);
