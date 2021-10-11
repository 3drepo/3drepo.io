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
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dasboardList.styles';
import { Trans } from '@lingui/react';
import { SearchPhrase } from './emptySearchResults.styles';

type IEmptySearchResults = {
	searchPhrase: string;
};

export const EmptySearchResults = ({ searchPhrase }: IEmptySearchResults): JSX.Element => (
	<DashboardListEmptyText>
		<Trans
			id="containers.noSearchResults"
			message="We couldn't find a match for <0>“{searchPhrase}”</0>. Please try another search."
			components={[<SearchPhrase />]}
			values={{ searchPhrase }}
		/>
	</DashboardListEmptyText>
);
