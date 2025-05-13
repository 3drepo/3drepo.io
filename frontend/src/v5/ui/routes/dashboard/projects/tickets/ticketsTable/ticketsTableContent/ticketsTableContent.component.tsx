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
import { useContext, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { EmptyPageView } from '../../../../../../components/shared/emptyPageView/emptyPageView.styles';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ResizableTableContext, ResizableTableContextComponent, TableColumn } from '@controls/resizableTableContext/resizableTableContext';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Transformers, useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsTableResizableContent, TicketsTableResizableContentProps } from './ticketsTableResizableContent/ticketsTableResizableContent.component';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { Container } from './ticketsTableContent.styles';
import { useEdgeScrolling } from '../edgeScrolling';

const COLUMNS: TableColumn[] = [
	{ name: 'id', width: 80, minWidth: 25 },
	{ name: BaseProperties.TITLE, width: 380, minWidth: 25, stretch: true },
	{ name: 'modelName', width: 170, minWidth: 25 },
	{ name: `properties.${BaseProperties.CREATED_AT}`, width: 127, minWidth: 25 },
	{ name: `properties.${IssueProperties.ASSIGNEES}`, width: 96, minWidth: 25 }, 
	{ name: `properties.${BaseProperties.OWNER}`, width: 52, minWidth: 25 },
	{ name: `properties.${IssueProperties.DUE_DATE}`, width: 147, minWidth: 25 },
	{ name: `properties.${IssueProperties.PRIORITY}`, width: 90, minWidth: 25 },
	{ name: `properties.${BaseProperties.STATUS}`, width: 150, minWidth: 52 },
	{ name: `modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`, width: 137, minWidth: 25 },
	{ name: `modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`, width: 134, minWidth: 25 },
];

const TableContent = ({ template, tableRef, ...props }: TicketsTableResizableContentProps & { template: ITemplate, tableRef }) => {
	const { filteredItems } = useContext(SearchContext);
	const { stretchTable, movingColumn, resetColumnsOrderAndVisibility } = useContext(ResizableTableContext);
	const edgeScrolling = useEdgeScrolling({ throttleTime: 20 });

	useEffect(() => {
		resetColumnsOrderAndVisibility();
		if (templateAlreadyFetched(template)) return;
		stretchTable();
	}, [template]);

	useEffect(() => {
		if (movingColumn) {
			edgeScrolling.start(tableRef.current);
			return edgeScrolling.stop;
		}
	}, [movingColumn]);

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
	const [modelsIds] = useSearchParam('models', Transformers.STRING_ARRAY);
	const tableRef = useRef(null);

	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const { config, modules } = template;
	const hasProperties = config?.issueProperties;
	const hasSafetibase = modules?.some((module) => module.type === 'safetibase');
	const showModelName = modelsIds.length > 1;

	const getHiddenColumns = () => {
		const cols = [];
		if (!showModelName) {
			cols.push('modelName');
		}
		if (!hasProperties) {
			cols.push(
				`properties.${IssueProperties.ASSIGNEES}`,
				`properties.${IssueProperties.DUE_DATE}`,
				`properties.${IssueProperties.PRIORITY}`,
			);
		}
		if (!hasSafetibase) {
			cols.push(
				`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`,
				`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`,
			);
		}
		return cols;
	};

	return (
		<ResizableTableContextComponent
			columns={COLUMNS}
			hiddenColumns={getHiddenColumns()}
			columnGap={1}
		>
			<Container ref={tableRef}>
				<TableContent {...props} tableRef={tableRef} template={template} />
			</Container>
		</ResizableTableContextComponent>
	);
};
