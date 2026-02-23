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

import { Link } from 'react-router-dom';
import LogoIcon from '@assets/icons/filled/logo-filled.svg';
import PrintIcon from '@assets/icons/outlined/print-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { AppBarContainer } from '@components/shared/appBar/appBar.styles';
import { COOKIES_ROUTE, DASHBOARD_ROUTE, PRIVACY_ROUTE, TERMS_ROUTE } from '@/v5/ui/routes/routes.constants';
import { NavbarButton } from '@controls/navbarButton/navbarButton.styles';
import { NavLink, NavLinks, Items } from './legalAppBar.styles';

type ILegalAppBar = {
	activePage: string;
};

export const LegalAppBar = ({ activePage }: ILegalAppBar): JSX.Element => (
	<AppBarContainer>
		<Items>
			<Link to={DASHBOARD_ROUTE}>
				<LogoIcon />
			</Link>
			<NavLinks>
				<NavLink as="a" href={PRIVACY_ROUTE} target="_blank" rel="noopener noreferrer">
					<FormattedMessage id="legalAppBar.privacy" defaultMessage="Privacy Policy" />
				</NavLink>
				<NavLink to={TERMS_ROUTE} selected={activePage === 'terms'}>
					<FormattedMessage id="legalAppBar.terms" defaultMessage="Terms and Conditions" />
				</NavLink>
				<NavLink to={COOKIES_ROUTE} selected={activePage === 'cookies'}>
					<FormattedMessage id="legalAppBar.cookies" defaultMessage="Cookies Policy" />
				</NavLink>
			</NavLinks>
		</Items>
		<Items>
			<NavbarButton onClick={window.print} aria-label="print">
				<PrintIcon />
			</NavbarButton>
		</Items>
	</AppBarContainer>
);
