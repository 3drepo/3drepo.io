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
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Button } from '@controls/button';
import { ContainersAndFederationsSelect } from '../selectMenus/containersAndFederationsSelect.component';
import { TemplateSelect } from '../selectMenus/templateSelect.component';
import { NONE_OPTION } from '../ticketsTable.helper';

export const TicketsSelection = () => {
	const { teamspace, project } = useParams();
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const [containersAndFederations, setContainersAndFederations] = useState([]);
	const [template, setTemplate] = useState<string>(NONE_OPTION);
	const isValid = template && containersAndFederations.length;

	const getPathname = () => {
		if (!isValid) return '';
		return generatePath(TICKETS_ROUTE, {
			teamspace,
			project,
			template,
			groupBy: NONE_OPTION,
		});
	};

	if (!teamspace || !project || !templates) return (<Loader />);

	return (
		<div style={{ display: 'flex', flexDirection: 'column'}}>
			<ContainersAndFederationsSelect
				value={containersAndFederations}
				onChange={setContainersAndFederations}
			/>
			<TemplateSelect value={template} onChange={setTemplate} />
			<Link
				disabled={!isValid}
				style={{ margin: '30px auto', width: 'fit-content' }}
				to={{
					pathname: getPathname(),
					search: `?models=${containersAndFederations.join(',')}`,
				}}
			>
				<Button variant="contained" disabled={!isValid}>
					Go to table
				</Button>
			</Link>
		</div>
	);
};
