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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { NavigationMenu } from '@components/shared/navigatonMenu';
import { Container, Breadcrumb, InteractiveBreadcrumb } from './breadcrumbs.styles';

export const Breadcrumbs = (): JSX.Element => {
	const getBreadcrumbs = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

	const handleClose = () => setAnchorEl(null);

	return (
		<Container aria-label="breadcrumb">

			{getBreadcrumbs.map((title, index) => {
				const isLastItem = (getBreadcrumbs.length - 1) === index;

				if (isLastItem) {
					return (
						<div>
							<InteractiveBreadcrumb onClick={handleClick} endIcon={<ExpandMoreIcon />}>
								{title}
							</InteractiveBreadcrumb>
							<NavigationMenu anchorEl={anchorEl} handleClose={handleClose} />
						</div>
					);
				}

				return (
					<Breadcrumb color="inherit" href={`#${title}`}>
						{title}
					</Breadcrumb>
				);
			})}
		</Container>
	);
};
