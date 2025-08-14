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

import { GroupRulesForm } from '@/v5/ui/routes/viewer/tickets/ticketsForm/ticketGroups/groups/groupRulesForm/groupRulesForm.component';
import { omit } from 'lodash';
import { useParams } from 'react-router-dom';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { GroupsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { IGroupRule } from '@/v5/store/tickets/tickets.types';
import { useState } from 'react';
import { Container } from './newCriterionForm.styles';

interface IProps {
	selectedCriterion?: IGroupRule & { _id: string };
	criteria: any[];
	criterionForm?: IGroupRule;
	onSubmit: (values: IGroupRule) => void;
	onClose: (values: IGroupRule) => void;
}

export const NewCriterionForm = ({ selectedCriterion, onSubmit, onClose, criteria = [], criterionForm }: IProps) => {
	const [key, setKey] = useState(0);
	const { containerOrFederation } = useParams<ViewerParams>();
	const rule = selectedCriterion ? omit(selectedCriterion, '_id') : null;

	const handleSubmit = (data) => {
		const formToSubmit = { ...data };
		if (selectedCriterion) {
			formToSubmit._id = selectedCriterion._id;
		}
		onSubmit(formToSubmit);
		setKey(key + 1);
		GroupsActionsDispatchers.setCriteriaFieldState({ criterionForm: null });
	};

	return (
		<Container>
			<GroupRulesForm
				key={key}
				containerOrFederation={containerOrFederation}
				rule={rule}
				existingRules={criteria}
				onSubmit={handleSubmit}
				onClose={onClose}
				dirtyRule={criterionForm}
			/>
		</Container>
	);
};
