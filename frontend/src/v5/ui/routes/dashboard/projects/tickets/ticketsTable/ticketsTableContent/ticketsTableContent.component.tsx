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
import { memo, useContext, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { EmptyPageView } from '../../../../../../components/shared/emptyPageView/emptyPageView.styles';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsTableResizableContent, TicketsTableResizableContentProps } from './ticketsTableResizableContent/ticketsTableResizableContent.component';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { Container } from './ticketsTableContent.styles';
import { useEdgeScrolling } from '../edgeScrolling';
import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { INITIAL_COLUMNS } from '../ticketsTable.helper';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { isEqual } from 'lodash';

const TableContent = ({ template, tableRef, ...props }: TicketsTableResizableContentProps & { template: ITemplate, tableRef }) => {
	const edgeScrolling = useEdgeScrolling();
	const { filteredItems } = useContext(SearchContext);
	const {
		stretchTable, getAllColumnsNames, subscribe, resetWidths,
		visibleSortedColumnsNames, setVisibleSortedColumnsNames,
	} = useContextWithCondition(ResizableTableContext, []);
	const templateWasFetched = templateAlreadyFetched(template);
	const tableHasCompletedRendering = visibleSortedColumnsNames.length > 0;

	useEffect(() => {
		const allColumns = getAllColumnsNames();
		const initialVisibleColumns = INITIAL_COLUMNS.filter((name) => allColumns.includes(name));
		setVisibleSortedColumnsNames(initialVisibleColumns);
		resetWidths();
	}, [template]);
	
	useEffect(() => {
		if (templateWasFetched && tableHasCompletedRendering) {
			stretchTable(BaseProperties.TITLE);
		}
	}, [template, templateWasFetched, tableHasCompletedRendering]);

	useEffect(() => {
		const onMovingColumnChange = (movingColumn) => {
			if (movingColumn) {
				edgeScrolling.start(tableRef.current);
			} else {
				edgeScrolling.stop();
			}
		};
		return subscribe(['movingColumn'], onMovingColumnChange);
	}, [edgeScrolling]);

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

export const TicketsTableContent = memo((props: TicketsTableResizableContentProps) => {
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const tableRef = useRef(null);

	return (
		<Container ref={tableRef}>
			<TableContent {...props} tableRef={tableRef} template={template} />
		</Container>
	);
}, isEqual);
