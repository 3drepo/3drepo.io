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

import { TICKETS_ROUTE } from '@/v5/ui/routes/routes.constants';
import { Link, generatePath, useParams } from 'react-router-dom';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Button } from '@controls/button';
import { FormProvider, useForm } from 'react-hook-form';
import { ContainersAndFederationsFormSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { TemplateFormSelect } from '../selectMenus/templateFormSelect.component';
import { NONE_OPTION } from '../ticketsTable.helper';

type FormType = {
	containersAndFederations: string[],
	template: string,
};
export const TicketsSelection = () => {
	const { teamspace, project } = useParams();
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();

	const formData = useForm<FormType>({
		defaultValues: {
			containersAndFederations: [],
			template: NONE_OPTION,
		},
	});

	const template = formData.watch('template');
	const containersAndFederations = formData.watch('containersAndFederations');

	const isValid = !!(template && containersAndFederations.length);

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
		<FormProvider {...formData}>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<ContainersAndFederationsFormSelect name="containersAndFederations" />
				<TemplateFormSelect name="template" />
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
		</FormProvider>
	);
};
