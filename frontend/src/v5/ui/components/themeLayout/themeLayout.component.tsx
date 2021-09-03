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
import { Typography, Divider, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircle';
import { useForm } from 'react-hook-form';
import { DashboardListItem } from '@components/dashboard/dashboardList/dashboardListItem';
import { DashboardList } from '@components/dashboard/dashboardList';
import {
	DashboardListItemTitle,
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components/';
import { Button } from '@components/controls/button';
import { Container } from './themeLayout.styles';

export const ThemeLayout = (): JSX.Element => {
	const { register } = useForm();

	const MockDashboardListItem = () => (
		<DashboardListItemRow>
			<DashboardListItemTitle subtitle="Latest revision: Revision code" width={200}>
				This is the container title
			</DashboardListItemTitle>
			<DashboardListItemText width={150}>
				Container code
			</DashboardListItemText>
			<DashboardListItemText>
				Category label
			</DashboardListItemText>
		</DashboardListItemRow>
	);

	return (
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

			<Typography variant="h3" gutterBottom>button-label</Typography>

			<Button variant="label" color="primary">Default</Button>
			<Button variant="label" color="primary" disabled>Disabled</Button>
			<Divider />

			<Button variant="label" color="primary" startIcon={<AddIcon />}>Default</Button>
			<Button variant="label" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
			<Divider />

			<Button variant="label" color="secondary">Default</Button>
			<Button variant="label" color="secondary" disabled>Disabled</Button>
			<Divider />

			<Button variant="label" color="secondary" startIcon={<AddIcon />}>Default</Button>
			<Button variant="label" color="secondary" startIcon={<AddIcon />} disabled>Disabled</Button>
			<Divider />

			<Typography variant="h3" gutterBottom>button-label-outlined</Typography>

			<Button variant="label-outlined" color="primary">Default</Button>
			<Button variant="label-outlined" color="primary" disabled>Disabled</Button>
			<Divider />

			<Button variant="label-outlined" color="primary" startIcon={<AddIcon />}>Default</Button>
			<Button variant="label-outlined" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
			<Divider />

			<Button variant="label-outlined" color="secondary">Default</Button>
			<Button variant="label-outlined" color="secondary" disabled>Disabled</Button>
			<Divider />

			<Button variant="label-outlined" color="secondary" startIcon={<AddIcon />}>Default</Button>
			<Button variant="label-outlined" color="secondary" startIcon={<AddIcon />} disabled>Disabled</Button>
			<Divider />

			<Typography variant="h3" gutterBottom>button-text</Typography>

			<Button variant="text" color="primary">Default</Button>
			<Button variant="text" color="primary" disabled>Disabled</Button>
			<Divider />

			<Button variant="text" color="primary" startIcon={<AddIcon />}>Default</Button>
			<Button variant="text" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
			<Divider />
			<TextField label="Input label" {...register('enabledInput')} />
			<br />
			<TextField label="Disabled*" value="disabled value" disabled />
			{' '}
			<br />
			<TextField label="Error*" {...register('errorInput')} error />
			&nbsp;
			{' '}
			<br />
			.
			<br />
			<TextField value="Input text without label" />
			<br />
			<Divider />

			<DashboardList>
				<DashboardListItem selected={false}>
					<MockDashboardListItem />
				</DashboardListItem>
				<DashboardListItem selected>
					<MockDashboardListItem />
				</DashboardListItem>
				<DashboardListItem selected={false} />
			</DashboardList>
		</Container>
	);
};
