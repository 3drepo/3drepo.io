/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import DialogContent from '@material-ui/core/DialogContent';
import { List, ListItem, Switch, Select, MenuItem, TextField, InputAdornment, Input } from '@material-ui/core';

interface IProps {
	content: string;
}

export const SettingsDialog = (props: any) => {
	return (
		<DialogContent>
			<List>
				<ListItem>
					Shading
					<Select style={{ marginLeft: 20}}
						value={1}
						name="shading"
					>
						<MenuItem value={0}>Standard</MenuItem>
						<MenuItem value={1}>Architectural</MenuItem>
					</Select>
				</ListItem>
				<ListItem>
					Lite Mode
					<Switch
					color="secondary"
					inputProps={{
						'aria-label': 'Lite mode'
					}}
				/>
				</ListItem>
				<ListItem>
					Shadows
					<Select style={{ marginLeft: 20}}
						value={1}
						name="shadows"
					>
						<MenuItem value={0}>None</MenuItem>
						<MenuItem value={1}>Soft</MenuItem>
						<MenuItem value={2}>Hard</MenuItem>
					</Select>
				</ListItem>
				<ListItem>
					Show Statistics
					<Switch
					color="secondary"
					inputProps={{
						'aria-label': 'Show Statistics'
					}}
				/>
				</ListItem>
				<ListItem>
					XRay highlighting
					<Switch
					color="secondary"
					inputProps={{
						'aria-label': 'XRay highlighting'
					}}
				/>
				</ListItem>
				<ListItem>
					Memory for Unity
					<Input
						style={{ marginLeft: 20}}
						inputProps={{style: { textAlign : 'right', width: 30}}}
						value="10"
						endAdornment={<InputAdornment position="end">Mb</InputAdornment>}
					/>
				</ListItem>
			</List>
		</DialogContent>
	);
};
