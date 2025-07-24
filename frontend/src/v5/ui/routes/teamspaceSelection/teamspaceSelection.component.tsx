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

import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { AppBar } from '@components/shared/appBar';
import { DashboardFooter } from '@components/shared/dashboardFooter';
import { TeamspaceList } from '@components/teamspace/teamspaceList';
import { useEffect, useRef, useState, type JSX } from 'react';
import { FormattedMessage } from 'react-intl';
import { FadeMessageTrigger, Content, PricingLink, ScrollBar, WelcomeMessage } from './teamspaceSelection.styles';

export const TeamspaceSelection = (): JSX.Element => {
	const firstName = CurrentUserHooksSelectors.selectFirstName();
	const [isVisible, setIsVisible] = useState(true);
	const welcomeRef = useRef(undefined);

	useEffect(() => {
		if (welcomeRef.current) {
			const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
			observer.observe(welcomeRef.current);
			return () => observer.disconnect();
		}
	}, []);

	return (
		<>
			<AppBar />
			<ScrollBar>
				<div>
					<Content>
						<FadeMessageTrigger ref={welcomeRef}>
							<WelcomeMessage $visible={isVisible}>
								{
									firstName ? (
										<FormattedMessage id="teamspaces.welcome.name" defaultMessage="Welcome back, {firstName}!" values={{ firstName }} />
									) : (
										<FormattedMessage id="teamspaces.welcome.noName" defaultMessage="Welcome back!" />
									)
								}
								<PricingLink to={{ pathname: 'https://3drepo.com/pricing/' }}>
									<FormattedMessage id="teamspaces.welcome.addTeamspace" defaultMessage="Add new Teamspace" />
								</PricingLink>
							</WelcomeMessage>
						</FadeMessageTrigger>
						<TeamspaceList />
					</Content>
				</div>
				<DashboardFooter variant="light" />
			</ScrollBar>
		</>
	);
};
