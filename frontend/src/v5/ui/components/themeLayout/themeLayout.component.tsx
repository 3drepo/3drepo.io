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
import { Divider, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircle';
import IntercomIcon from '@assets/icons/v5/intercom.svg';
import NotificationsIcon from '@assets/icons/v5/notifications.svg';

import { useForm } from 'react-hook-form';

import { AppBar } from '@components/shared/appBar';
import { Breadcrumbs } from '@components/shared/breadcrumbs';
import { TopNavigation } from '@components/shared/topNavigation';
import { NavigationMenu } from '@components/shared/navigatonMenu';
import { Button } from '@controls/button';
import { CircleButton } from '@controls/circleButton';
import { AvatarButton } from '@controls/avatarButton';
import { DashboardListItem } from '@components/dashboard/dashboardList/dashboardListItem';
import { DashboardList } from '@components/dashboard/dashboardList';
import {
	DashboardListItemTitle,
	DashboardListItemRow,
	DashboardListItemText,
	DashboardListItemButton,
} from '@components/dashboard/dashboardList/dashboardListItem/components/';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { AppBarGroup, BaseBackground, Container, ContrastBackground, Group } from './themeLayout.styles';
import { Typography } from '../../themes/typography';

const LINKS = [{
	title: 'Federations',
	to: '#federations',
	active: true,
}, {
	title: 'Containers',
	to: '#container',
}, {
	title: 'Tasks',
	to: '#tasks',
}, {
	title: 'Users',
	to: '#users',
}, {
	title: 'Settings',
	to: '#settings',
	disabled: true,
}];

const menuList = [{
	title: 'Teamspace title 1',
	to: '/#teamspace1',
}, {
	title: 'Teamspace title 2',
	to: '/#teamspace2',
}, {
	title: 'Teamspace title 3',
	to: '/#teamspace3',
}, {
	title: 'Teamspace title 4',
	to: '/#teamspace4',
}, {
	title: 'Teamspace title 5',
	to: '/#teamspace5',
}];

export const ThemeLayout = (): JSX.Element => {
	const { register } = useForm();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

	const handleClose = () => setAnchorEl(null);

	const MockDashboardListItem = () => (
		<DashboardListItemRow>
			<DashboardListItemTitle subtitle="Latest revision: Revision code" width={200}>
				This is the container title
			</DashboardListItemTitle>
			<DashboardListItemText width={150}>
				Container code
			</DashboardListItemText>
			<DashboardListItemButton onClick={() => undefined}>
				1234 Revisions
			</DashboardListItemButton>
			<DashboardListItemText>
				Category label
			</DashboardListItemText>
		</DashboardListItemRow>
	);

	return (
		<Container>
			<Typography variant="h1" gutterBottom>Theme Demonstration Page</Typography>

			<Group>
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
			</Group>

			<Group>
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
			</Group>

			<Group>
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
			</Group>

			<Group>
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
			</Group>

			<Group>
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
			</Group>

			<Group>
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
			</Group>

			<Group>
				<Typography variant="h3" gutterBottom>button-text</Typography>

				<Button variant="text" color="primary">Default</Button>
				<Button variant="text" color="primary" disabled>Disabled</Button>
				<Divider />

				<Button variant="text" color="primary" startIcon={<AddIcon />}>Default</Button>
				<Button variant="text" color="primary" startIcon={<AddIcon />} disabled>Disabled</Button>
				<Divider />
			</Group>

			<Group>
				<TextField label="Input label" {...register('enabledInput')} />
				<br />
				<TextField label="Disabled*" value="disabled value" disabled />
				<br />
				<TextField label="Error*" {...register('errorInput')} error />
				<br />
				<TextField value="Input text without label" />
				<br />
				<Divider />
			</Group>

			<Group>
				<Typography variant="h2" gutterBottom>UI controls needed for basic layout</Typography>

				<Group>
					<Typography variant="h3" gutterBottom>Breadcrumbs</Typography>
					<Breadcrumbs />
					<Typography variant="h3" gutterBottom>Top Navigation</Typography>
					<ContrastBackground>
						<TopNavigation links={LINKS} />
					</ContrastBackground>
				</Group>

				<Group>
					<Typography variant="h3" gutterBottom>Circle buttons</Typography>
					<Typography variant="h4" gutterBottom>Favourite checkbox</Typography>
					<BaseBackground>
						<FavouriteCheckbox checked={false} onChange={() => undefined} />
						<FavouriteCheckbox checked onChange={() => undefined} />
						<FavouriteCheckbox checked={false} onChange={() => undefined} disabled />
					</BaseBackground>

					<ContrastBackground>
						<FavouriteCheckbox checked={false} onChange={() => undefined} />
						<FavouriteCheckbox checked onChange={() => undefined} />
						<FavouriteCheckbox checked={false} onChange={() => undefined} disabled />
					</ContrastBackground>

					<Typography variant="h4" gutterBottom>icon-intercom</Typography>
					<ContrastBackground>
						<CircleButton onClick={() => undefined} variant="contrast" aria-label="intercom">
							<IntercomIcon />
						</CircleButton>
						<CircleButton onClick={() => undefined} variant="contrast" aria-label="intercom" disabled>
							<IntercomIcon />
						</CircleButton>
					</ContrastBackground>

					<Typography variant="h4" gutterBottom>icon-nav-notifications</Typography>
					<ContrastBackground>
						<CircleButton onClick={() => undefined} variant="contrast" aria-label="notifications">
							<NotificationsIcon />
						</CircleButton>
						<CircleButton onClick={() => undefined} variant="contrast" aria-label="notifications" disabled>
							<NotificationsIcon />
						</CircleButton>
					</ContrastBackground>

					<Typography variant="h4" gutterBottom>icon-profile</Typography>
					<ContrastBackground>
						<AvatarButton>
							GH
						</AvatarButton>
						<AvatarButton disabled>
							GH
						</AvatarButton>
					</ContrastBackground>
				</Group>
			</Group>

			<Group>
				<Typography variant="h3" gutterBottom>Navigation Menu</Typography>
				<Button variant="contained" color="primary" onClick={handleClick}>Show Menu</Button>
				<NavigationMenu anchorEl={anchorEl} handleClose={handleClose} list={menuList} />
			</Group>

			<AppBarGroup>
				<Typography variant="h3" gutterBottom>AppBar (with logo only)</Typography>
				<AppBar />
			</AppBarGroup>

			<Group>
				<Typography variant="h3" gutterBottom>DashboardList</Typography>
				<DashboardList>
					<DashboardListItem selected={false}>
						<MockDashboardListItem />
					</DashboardListItem>
					<DashboardListItem selected>
						<MockDashboardListItem />
					</DashboardListItem>
					<DashboardListItem selected={false} />
				</DashboardList>
			</Group>
		</Container>
	);
};
