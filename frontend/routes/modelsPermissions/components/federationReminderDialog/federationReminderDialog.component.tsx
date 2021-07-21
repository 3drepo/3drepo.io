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

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Model } from './federationReminderDialog.styles';

interface IProps {
	models: any[];
	handleResolve: () => string;
}

export const FederationReminderDialog = (props: IProps) => {
	const renderModels = (models = []) => {
		return models.map((model, index) => {
			return <Model key={index}>{model}</Model>;
		});
	};

	return (
		<>
			<DialogContent>
				Just to let you know, the assigned users(s) will need permissions on submodels also to see them.
				<br /><br />
				These are the models in question:
				<br /><br />
				{renderModels(props.models)}
			</DialogContent>

			<DialogActions>
				<Button onClick={props.handleResolve} variant="contained" color="secondary">Ok</Button>;
			</DialogActions>
		</>
	);
};
