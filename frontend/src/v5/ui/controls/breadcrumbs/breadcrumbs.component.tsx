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
import { useState, MouseEvent, type JSX } from 'react';
import HomeIcon from '@assets/icons/outlined/home-outlined.svg';
import DownArrowIcon from '@assets/icons/outlined/chevron-outlined.svg';
import { DASHBOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { Container, HomeIconBreadcrumb, Breadcrumb, InteractiveBreadcrumb, OverflowWrapper } from './breadcrumbs.styles';
import { BreadcrumbDropdown, BreadcrumbItem } from './breadcrumbDropdown/breadcrumbDropdown.component';

export interface BreadcrumbOptions {
	options: BreadcrumbItem[];
	secondary?: boolean;
}

export type BreadcrumbItemOrOptions = BreadcrumbOptions | BreadcrumbItem;

interface IProps {
	breadcrumbs: BreadcrumbItemOrOptions[];
}

export const Breadcrumbs = ({ breadcrumbs }:IProps): JSX.Element => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [indexOpened, setIndexOpened] = useState<null | number>(null);

	const handleClick = (index) => (event: MouseEvent<HTMLButtonElement>) => {
		setIndexOpened(index);
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => setAnchorEl(null);

	return (
		<Container aria-label="breadcrumb">
			<HomeIconBreadcrumb $active={!breadcrumbs.length} color="inherit" to={DASHBOARD_ROUTE}>
				<HomeIcon />
			</HomeIconBreadcrumb>

			{breadcrumbs.map((item, index) => {
				let { title } = item as BreadcrumbItem;

				if ((item as BreadcrumbOptions).options?.length > 0) {
					const { options, secondary } = (item as BreadcrumbOptions);

					// If no options is marked as selected use the first one
					title = (options.find(({ selected }) => selected) || options[0])?.title;

					return (
						<div key={title}>
							<InteractiveBreadcrumb
								$secondary={secondary}
								onClick={handleClick(index)}
								endIcon={<DownArrowIcon />}
							>
								<OverflowWrapper>
									{title}
								</OverflowWrapper>
							</InteractiveBreadcrumb>
							<BreadcrumbDropdown
								options={options}
								anchorEl={anchorEl}
								open={indexOpened === index}
								handleClose={handleClose}
							/>
						</div>
					);
				}

				const { to = '#' } = item as BreadcrumbItem;

				return (
					<Breadcrumb key={to} color="inherit" to={to}>
						{title}
					</Breadcrumb>
				);
			})}
		</Container>
	);
};
