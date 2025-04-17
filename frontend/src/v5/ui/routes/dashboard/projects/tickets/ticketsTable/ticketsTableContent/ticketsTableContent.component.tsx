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
import { ResizableTableContext, ResizableTableContextComponent } from '@controls/resizableTableContext/resizableTableContext';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsTableResizableContent, TicketsTableResizableContentProps } from './ticketsTableResizableContent/ticketsTableResizableContent.component';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { TicketsTableContextComponent } from '../ticketsTableContext/ticketsTableContext';
import { getAvailableColumnsForTemplate } from '../ticketsTableContext/ticketsTableContext.helpers';
import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';

const TableContent = ({ template, ...props }: TicketsTableResizableContentProps & { template: ITemplate }) => {
	const { filteredItems } = useContext(SearchContext);
	const { stretchTable, getVisibleColumnsNames, setHiddenColumns } = useContext(ResizableTableContext);
	const templateWasFetched = templateAlreadyFetched(template);
	const hasVisibleColumns = getVisibleColumnsNames().length > 0;
	
	useEffect(() => {
		if (templateWasFetched && hasVisibleColumns) {
			stretchTable([BaseProperties.TITLE]);
		}
	}, [template, templateWasFetched, hasVisibleColumns]);

	useEffect(() => {
		if (templateWasFetched && !hasVisibleColumns) {
			setHiddenColumns((hiddenColumns) => hiddenColumns.filter((col) => col !== 'id'));
		}
	}, [hasVisibleColumns, templateWasFetched]);

	if (!templateWasFetched) {
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
	const templatHasBeenFetched = templateAlreadyFetched(template);
	const columns = templatHasBeenFetched ? getAvailableColumnsForTemplate(template) : [];

	return (
		<TicketsTableContextComponent template={template}>
			<ResizableTableContextComponent columns={columns} columnGap={1}>
				<TableContent {...props} template={template} />
			</ResizableTableContextComponent>
		</TicketsTableContextComponent>
	);
};