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

import { useHistory, Link } from 'react-router-dom';
import LogoIcon from '@assets/icons/logo.svg';
import PrintIcon from '@assets/icons/print.svg';
import { CircleButton } from '@/v5/ui/controls/circleButton';
import { AppBarContainer, Items } from '@components/shared/appBar/appBar.styles';
import { DASHBOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { NavLink, NavLinks } from './legalAppBar.styles';

const { legal: LEGAL_PAPERS } = ClientConfig;

export const LegalAppBar = ({ activePage }): JSX.Element => {
	const history = useHistory();
	const onTabChange = (_, selectedTab) => {
		history.push(`/v5/${selectedTab}`);
	};
	return (
		<AppBarContainer position="static">
			<Items>
				<Link to={DASHBOARD_ROUTE}>
					<LogoIcon />
				</Link>
				<NavLinks>
					{
						LEGAL_PAPERS.map(({ page, title }) => (
							<NavLink onClick={() => onTabChange('_', page)} key={page} selected={page === activePage}>
								{title}
							</NavLink>
						))
					}
				</NavLinks>
			</Items>
			<Items>
				<CircleButton onClick={window.print} variant="contrast" aria-label="print">
					<PrintIcon />
				</CircleButton>
			</Items>
		</AppBarContainer>
	);
};
