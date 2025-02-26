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

import { SearchContext } from '@controls/search/searchContext';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { EmptyPageView } from '../../../../../../components/shared/emptyPageView/emptyPageView.styles';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ResizableTableContext, ResizableTableContextComponent, TableColumn } from '@controls/resizableTableContext/resizableTableContext';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsTableResizableContent, TicketsTableResizableContentProps } from './ticketsTableResizableContent/ticketsTableResizableContent.component';
import { getUnavailableColumnsForTemplate } from '../ticketsTable.helper';
import { ITemplate } from '@/v5/store/tickets/tickets.types';

const COLUMNS: TableColumn[] = [
	{ name: 'id', width: 80, minWidth: 25 },
	{ name: BaseProperties.TITLE, width: 380, minWidth: 25, stretch: true },
	{ name: 'modelName', width: 145, minWidth: 25 },
	{ name: `properties.${BaseProperties.CREATED_AT}`, width: 127, minWidth: 25 },
	{ name: `properties.${IssueProperties.ASSIGNEES}`, width: 96, minWidth: 25 }, 
	{ name: `properties.${BaseProperties.OWNER}`, width: 52, minWidth: 25 },
	{ name: `properties.${IssueProperties.DUE_DATE}`, width: 147, minWidth: 25 },
	{ name: `properties.${IssueProperties.PRIORITY}`, width: 90, minWidth: 25 },
	{ name: `properties.${BaseProperties.STATUS}`, width: 150, minWidth: 52 },
	{ name: `modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`, width: 137, minWidth: 25 },
	{ name: `modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`, width: 134, minWidth: 25 },
];

const TableContent = ({ template, ...props }: TicketsTableResizableContentProps & { template: ITemplate }) => {
	const { filteredItems } = useContext(SearchContext);
	const { setHiddenColumns, hiddenColumns, unavailableColumns, getVisibleColumnsNames } = useContext(ResizableTableContext);

	useEffect(() => {
		if (templateAlreadyFetched(template) && !getVisibleColumnsNames().length) {
			setHiddenColumns(hiddenColumns.filter((col) => col !== 'id'));
		}
	}, [unavailableColumns.length, template]);

	if (!templateAlreadyFetched(template)) {
		return (
			<EmptyPageView>
				<Spinner />
			</EmptyPageView>
		);
	}

	if (!filteredItems.length) {
		return (
			<EmptyPageView>
				<FormattedMessage
					id="ticketTable.emptyView"
					defaultMessage="We couldn't find any tickets to show. Please refine your selection."
				/>
			</EmptyPageView>
		);
	}

	return <TicketsTableResizableContent {...props} />;
};

export const TicketsTableContent = (props: TicketsTableResizableContentProps) => {
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);

	return (
		<ResizableTableContextComponent
			columns={COLUMNS}
			unavailableColumns={getUnavailableColumnsForTemplate(template)}
			columnGap={1}
		>
			<TableContent {...props} template={template} />
		</ResizableTableContextComponent>
	);
};