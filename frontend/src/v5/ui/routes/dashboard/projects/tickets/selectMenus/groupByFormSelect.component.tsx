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

import { FormattedMessage } from 'react-intl';
import { FormSelect } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import { BaseProperties, IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { useFormContext } from 'react-hook-form';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useEffect } from 'react';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { NONE_OPTION } from '../ticketsTable/ticketsTable.helper';
import { MenuItem } from './selectMenus.styles';

const NONE_OPTION_MESSAGE = formatMessage({ id: 'tickets.selectOption.none', defaultMessage: 'None' });

const GROUP_OPTIONS = {
	[BaseProperties.OWNER]: formatMessage({ id: 'groupBy.owner', defaultMessage: 'Owner' }),
	[IssueProperties.DUE_DATE]: formatMessage({ id: 'groupBy.dueDate', defaultMessage: 'Due date' }),
	[IssueProperties.PRIORITY]: formatMessage({ id: 'groupBy.priority', defaultMessage: 'Priority' }),
	[IssueProperties.STATUS]: formatMessage({ id: 'groupBy.status', defaultMessage: 'Status' }),
	[SafetibaseProperties.LEVEL_OF_RISK]: formatMessage({ id: 'groupBy.levelOfRisk', defaultMessage: 'Level of risk' }),
	[SafetibaseProperties.TREATMENT_STATUS]: formatMessage({ id: 'groupBy.treatmentStatus', defaultMessage: 'Treatment status' }),
};

export const GroupByFormSelect = (props) => {
	const { getValues, setValue } = useFormContext();

	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(getValues('template'));
	const templateWasFetched = templateAlreadyFetched(template);
	const hasProperties = template?.config?.issueProperties;
	const hasSafetibase = template?.modules?.some((module) => module.type === 'safetibase');

	const teamplateAllowsGroup = () => {
		const groupBy = getValues('groupBy');
		if (!hasProperties && [IssueProperties.DUE_DATE, IssueProperties.PRIORITY, IssueProperties.STATUS].includes(groupBy)) return false;
		if (!hasSafetibase && [SafetibaseProperties.LEVEL_OF_RISK, SafetibaseProperties.TREATMENT_STATUS].includes(groupBy)) return false;
		return true;
	};

	useEffect(() => {
		if (!templateWasFetched || teamplateAllowsGroup()) return;
		setValue('groupBy', NONE_OPTION);
	}, [template, templateWasFetched]);

	return (
		<FormSelect
			{...props}
			label={formatMessage({ id: 'ticketTable.groupBy.placeholder', defaultMessage: 'Group by:' })}
			renderValue={(groupBy: string | null) => (
				<>
					<FormattedMessage id="ticketTable.groupBy.renderValue" defaultMessage="Group by:" />
					<b> {GROUP_OPTIONS[groupBy] || NONE_OPTION_MESSAGE}</b>
				</>
			)}
		>
			<MenuItem value={NONE_OPTION}>
				{NONE_OPTION_MESSAGE}
			</MenuItem>
			<MenuItem value={BaseProperties.OWNER} key={BaseProperties.OWNER}>
				{GROUP_OPTIONS[BaseProperties.OWNER]}
			</MenuItem>
			<MenuItem value={IssueProperties.DUE_DATE} key={IssueProperties.DUE_DATE} hidden={!hasProperties}>
				{GROUP_OPTIONS[IssueProperties.DUE_DATE]}
			</MenuItem>
			<MenuItem value={IssueProperties.PRIORITY} key={IssueProperties.PRIORITY} hidden={!hasProperties}>
				{GROUP_OPTIONS[IssueProperties.PRIORITY]}
			</MenuItem>
			<MenuItem value={IssueProperties.STATUS} key={IssueProperties.STATUS} hidden={!hasProperties}>
				{GROUP_OPTIONS[IssueProperties.STATUS]}
			</MenuItem>
			<MenuItem value={SafetibaseProperties.LEVEL_OF_RISK} key={SafetibaseProperties.LEVEL_OF_RISK} hidden={!hasSafetibase}>
				{GROUP_OPTIONS[SafetibaseProperties.LEVEL_OF_RISK]}
			</MenuItem>
			<MenuItem value={SafetibaseProperties.TREATMENT_STATUS} key={SafetibaseProperties.TREATMENT_STATUS} hidden={!hasSafetibase}>
				{GROUP_OPTIONS[SafetibaseProperties.TREATMENT_STATUS]}
			</MenuItem>
		</FormSelect>
	);
};
