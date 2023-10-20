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
import { useEffect, useState } from 'react';
import _, { uniqueId } from 'lodash';
import { ThemeProvider } from 'styled-components';
import { palette } from '@/v5/ui/themes/theme';
import { MuiTheme as v4Theme } from '@/v4/styles';
import { isV5 } from '@/v4/helpers/isV5';
import { Container } from './newCriterionForm.styles';

interface IProps {
	criterion: any;
	alreadySelectedFilters: any[];
	onSubmit: (values) => void;
	selectedCriterion: any;
}

export const NewCriterionForm = ({ criterion, onSubmit, alreadySelectedFilters = [] }: IProps) => {
	// used to clear the form after saving
	const [key, setKey] = useState(uniqueId());

	const theme = isV5() ? {} : _.merge(_.cloneDeep(v4Theme), { palette });

	const handleSubmit = (data) => {
		setKey(uniqueId());
		onSubmit(data);
	};

	useEffect(() => {
		setKey(uniqueId());
	}, [criterion?._id]);

	return (
		<Container>
			<ThemeProvider theme={theme as any}>
				<GroupRulesForm
					key={key}
					rule={criterion}
					existingRules={alreadySelectedFilters}
					onSave={handleSubmit}
					onClose={() => {}}
				/>
			</ThemeProvider>
		</Container>
	);
};