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
import { useState, MouseEvent } from 'react';
import HomeIcon from '@assets/icons/home.svg';
import DownArrowIcon from '@assets/icons/down_arrow.svg';
import { DASHBOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { NavigationMenu } from './navigatonMenu';
import { Container, HomeIconBreadcrumb, Breadcrumb, InteractiveBreadcrumb, OverflowWrapper } from './breadcrumbs.styles';
import { IListItem } from './navigatonMenu/navigationMenu.component';

interface IProps {
	options: IListItem[];
	breadcrumbs: IListItem[];
}

export const Breadcrumbs = ({ breadcrumbs, options }:IProps): JSX.Element => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	return (
		<Container aria-label="breadcrumb">
			<HomeIconBreadcrumb color="inherit" to={DASHBOARD_ROUTE}>
				<HomeIcon />
			</HomeIconBreadcrumb>

			{breadcrumbs.map(({ title, to, id }, index) => (
				(breadcrumbs.length - 1) === index && options.length
					? (
						<div key={title}>
							<InteractiveBreadcrumb onClick={handleClick} endIcon={<DownArrowIcon />}>
								<OverflowWrapper>
									{title}
								</OverflowWrapper>
							</InteractiveBreadcrumb>
							<NavigationMenu
								list={options}
								anchorEl={anchorEl}
								selectedItem={id || title}
								handleClose={handleClose}
							/>
						</div>
					) : (
						<Breadcrumb key={title} color="inherit" to={to}>
							{title}
						</Breadcrumb>
					)
			))}
		</Container>
	);
};
