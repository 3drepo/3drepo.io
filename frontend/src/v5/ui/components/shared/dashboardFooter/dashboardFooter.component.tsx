/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { Link } from 'react-router-dom';
import { FooterContainer, FooterItem, FooterItems, FooterLogo } from './dashboardFooter.styles';

const FOOTER_ITEMS = [
	{
		label: formatMessage({
			id: 'dashboardFooter.privacy',
			defaultMessage: 'Privacy',
		}),
		to: '/v5/privacy',
	},
	{
		label: formatMessage({
			id: 'dashboardFooter.terms',
			defaultMessage: 'Terms',
		}),
		to: '/v5/terms',
	},
	{
		label: formatMessage({
			id: 'dashboardFooter.cookies',
			defaultMessage: 'Cookies',
		}),
		to: '/v5/cookies',
	},
	{
		label: formatMessage({
			id: 'dashboardFooter.pricing',
			defaultMessage: 'Pricing',
		}),
		to: 'https://3drepo.org/pricing/',
	},
];

export const DashboardFooter = (): JSX.Element => (
	<FooterContainer showLabels>
		<FooterLogo />
		<FooterItems>
			{FOOTER_ITEMS.map(({ label, to }) => (
				<FooterItem>
					<Link to={to}>
						{label}
					</Link>
				</FooterItem>
			))}
		</FooterItems>
	</FooterContainer>
);
