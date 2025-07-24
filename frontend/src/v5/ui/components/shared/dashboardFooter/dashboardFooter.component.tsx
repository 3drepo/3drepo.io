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

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { PRIVACY_ROUTE } from '@/v5/ui/routes/routes.constants';
import { FooterContainer, FooterItem, FooterItems, FooterLogo } from './dashboardFooter.styles';

import type { JSX } from "react";

type IDashboardFooter = {
	variant?: 'light' | 'dark';
};

export const DashboardFooter = ({ variant = 'light' }: IDashboardFooter): JSX.Element => (
	<FooterContainer variant={variant} showLabels>
		<FooterLogo />
		<FooterItems>
			<FooterItem>
				<Link to={{ pathname: PRIVACY_ROUTE }} target="_blank" rel="noopener noreferrer">
					<FormattedMessage id="dashboardFooter.privacy" defaultMessage="Privacy" />
				</Link>
			</FooterItem>
			<FooterItem>
				<Link to="/v5/terms" target="_blank">
					<FormattedMessage id="dashboardFooter.terms" defaultMessage="Terms" />
				</Link>
			</FooterItem>
			<FooterItem>
				<Link to="/v5/cookies" target="_blank">
					<FormattedMessage id="dashboardFooter.cookies" defaultMessage="Cookies" />
				</Link>
			</FooterItem>
			<FooterItem>
				<a href="https://3drepo.com/pricing" target="_blank">
					<FormattedMessage
						id="dashboardFooter.pricing"
						defaultMessage="Pricing"
					/>
				</a>
			</FooterItem>
		</FooterItems>
	</FooterContainer>
);
