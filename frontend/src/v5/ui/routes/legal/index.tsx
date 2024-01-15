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

import { Switch } from 'react-router-dom';
import { Route } from '@/v5/services/routing/route.component';
import { CookiesLegalPaper, TermsLegalPaper } from '@components/legal';
import { LegalLayout } from '@components/legal/LegalLayout/legalLayout.component';
import { formatMessage } from '@/v5/services/intl';
import { PRIVACY_ROUTE } from '../routes.constants';

type ILegalRoutes = {
	path: string;
};

export const LegalRoutes = ({ path }: ILegalRoutes) => (
	<LegalLayout>
		<Switch>
			<Route title={formatMessage({ id: 'pageTitle.terms', defaultMessage: 'Terms & Conditions' })} exact path={`${path}/terms`}>
				<TermsLegalPaper />
			</Route>
			<Route title={formatMessage({ id: 'pageTitle.cookies', defaultMessage: 'Cookies Policy' })} exact path={`${path}/cookies`}>
				<CookiesLegalPaper />
			</Route>
			<Route title={formatMessage({ id: 'pageTitle.privacy', defaultMessage: 'Privacy Policy' })} exact path={`${path}/privacy`}>
				{() => window.location.href = PRIVACY_ROUTE}
			</Route>
		</Switch>
	</LegalLayout>
);
