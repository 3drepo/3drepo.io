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

import { FormattedMessage } from 'react-intl';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dashboardList.styles';
import { SearchContext } from '@controls/search/searchContext';
import { useContext, type JSX } from 'react';
import { SearchPhrase } from './dashboardListEmptySearchResults.styles';

export const DashboardListEmptySearchResults = (): JSX.Element => {
	const { query } = useContext(SearchContext);
	return (
		<DashboardListEmptyText>
			<FormattedMessage
				id="dashboardList.noSearchResults"
				defaultMessage="We couldn't find a match for {searchPhrase}. Please try another search."
				values={{
					searchPhrase: <SearchPhrase>&quot;{query}&quot;</SearchPhrase>,
				}}
			/>
		</DashboardListEmptyText>
	);
};
