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

import React from 'react';
import { Typography, Button, Divider } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircle';

import { Container } from './themeLayout.styles';

export const ThemeLayout = (): JSX.Element => (
	<Container>
		<Typography variant="h1" gutterBottom>Theme Demonstration Page</Typography>
		<Typography variant="h2" gutterBottom>Buttons</Typography>
		<Typography variant="h3" gutterBottom>button-contained-standard</Typography>

		<Button variant="contained" color="primary">Default</Button>
		<Button variant="contained" color="primary" disabled>Disabled</Button>
		<Divider />

		<Button variant="contained" color="primary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="contained" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Button variant="contained" color="secondary">Default</Button>
		<Button variant="contained" color="secondary" disabled>Disabled</Button>
		<Divider />

		<Button variant="contained" color="secondary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="contained" color="secondary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Typography variant="h3" gutterBottom>button-outlined-standard</Typography>

		<Button variant="outlined" color="primary">Default</Button>
		<Button variant="outlined" color="primary" disabled>Disabled</Button>
		<Divider />

		<Button variant="outlined" color="primary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="outlined" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Button variant="outlined" color="secondary">Default</Button>
		<Button variant="outlined" color="secondary" disabled>Disabled</Button>
		<Divider />

		<Button variant="outlined" color="secondary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="outlined" color="secondary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Typography variant="h3" gutterBottom>button-contained-small</Typography>

		<Button variant="contained" size="small" color="primary">Default</Button>
		<Button variant="contained" size="small" color="primary" disabled>Disabled</Button>
		<Divider />

		<Button variant="contained" size="small" color="primary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="contained" size="small" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Button variant="contained" size="small" color="secondary">Default</Button>
		<Button variant="contained" size="small" color="secondary" disabled>Disabled</Button>
		<Divider />

		<Button variant="contained" size="small" color="secondary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="contained" size="small" color="secondary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Typography variant="h3" gutterBottom>button-outlined-small</Typography>

		<Button variant="outlined" size="small" color="primary">Default</Button>
		<Button variant="outlined" size="small" color="primary" disabled>Disabled</Button>
		<Divider />

		<Button variant="outlined" size="small" color="primary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="outlined" size="small" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Button variant="outlined" size="small" color="secondary">Default</Button>
		<Button variant="outlined" size="small" color="secondary" disabled>Disabled</Button>
		<Divider />

		<Button variant="outlined" size="small" color="secondary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="outlined" size="small" color="secondary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

		<Typography variant="h3" gutterBottom>button-text</Typography>

		<Button variant="text" color="primary">Default</Button>
		<Button variant="text" color="primary" disabled>Disabled</Button>
		<Divider />

		<Button variant="text" color="primary" startIcon={<AddIcon />}>Default</Button>
		<Button variant="text" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
		<Divider />

	</Container>
);
