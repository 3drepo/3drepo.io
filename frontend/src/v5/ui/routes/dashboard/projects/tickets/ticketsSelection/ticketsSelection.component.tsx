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

import { DashboardParams, TICKETS_ROUTE } from '@/v5/ui/routes/routes.constants';
import { generatePath, useParams, useNavigate } from 'react-router-dom';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { SubmitButton } from '@controls/submitButton';
import { ContainersAndFederationsFormSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { TemplateFormSelect } from '../selectMenus/templateFormSelect.component';
import { Form, Title, Image } from './ticketsSelection.styles';
import { Transformers, useSearchParam } from '@/v5/ui/routes/useSearchParam';

type FormType = {
	containersAndFederations: string[],
	template: string,
};
export const TicketsSelection = () => {
	const { teamspace, project } = useParams<DashboardParams>();
	const [models] = useSearchParam('models', Transformers.STRING_ARRAY);
	const navigate = useNavigate();
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();

	const formData = useForm<FormType>({
		defaultValues: {
			containersAndFederations: models,
			template: '',
		},
	});

	const template = formData.watch('template');
	const containersAndFederations = formData.watch('containersAndFederations');

	const isValid = !!(template && containersAndFederations.length);

	const goToTableView = () => {
		if (!isValid) return;

		const search = `models=${containersAndFederations.join(',')}`;
		const pathname = generatePath(TICKETS_ROUTE, {
			teamspace,
			project,
			template,
		});

		navigate({ pathname, search });
	};

	if (!teamspace || !project || !templates) return (<Loader />);

	return (
		<Form onSubmit={goToTableView}>
			<FormProvider {...formData}>
				<Image src="assets/images/tabular_view_preview.png" />
				<Title>
					<FormattedMessage
						id="ticketsTable.select.title"
						defaultMessage="Select a Federation/Container {br} and a Ticket type to view your Tickets"
						values={{ br: <br /> }}
					/>
				</Title>
				<ContainersAndFederationsFormSelect name="containersAndFederations" />
				<TemplateFormSelect name="template" />
				<SubmitButton disabled={!isValid}>
					<FormattedMessage
						id="tickets.table.button"
						defaultMessage="View Table"
					/>
				</SubmitButton>
			</FormProvider>
		</Form>
	);
};
