/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { useState } from 'react';
import { TICKETS_ROUTE } from '@/v5/ui/routes/routes.constants';
import { Link, generatePath, useParams } from 'react-router-dom'; 
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { ContainersAndFederationsSelect } from '../selectMenus/containersAndFederationsSelect.component';
import { GroupBySelect } from '../selectMenus/groupBySelect.component';
import { useContainersData } from '../../containers/containers.hooks';
import { useFederationsData } from '../../federations/federations.hooks';

export const TicketsSelection = () => {
	const { teamspace, project } = useParams();
	const { isListPending: areContainersPending } = useContainersData();
	const { isListPending: areFederationsPending } = useFederationsData();
	const [containersAndFederations, setContainersAndFederations] = useState([]);
	const [groupBy, setGroupBy] = useState('');
	const isValid = groupBy && containersAndFederations.length;

	const getPathname = () => {
		if (!isValid) return '';
		return generatePath(TICKETS_ROUTE, {
			teamspace,
			project,
			groupBy,
		});
	};

	if (!teamspace || !project || areFederationsPending || areContainersPending) return (<Loader />);

	return (
		<div style={{ display: 'flex', flexDirection: 'column'}}>
			<ContainersAndFederationsSelect
				value={containersAndFederations}
				onChange={setContainersAndFederations}
			/>
			<GroupBySelect value={groupBy} onChange={setGroupBy} />
			<button disabled={!isValid}>
				<Link
					style={{ height: '100%', width: '100%' }}
					to={{
						pathname: getPathname(),
						search: `?models=${containersAndFederations.join(',')}`,
					}}
				>
					Go to table
				</Link>
			</button>
		</div>
	);
};
