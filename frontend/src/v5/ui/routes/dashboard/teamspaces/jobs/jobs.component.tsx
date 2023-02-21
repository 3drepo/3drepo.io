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

import { Jobs as V4Jobs } from '@/v4/routes/jobs';
import { NewJobBottomButton, V5JobsOverrides } from '@/v5/ui/v4Adapter/overrides/jobs.overrides';
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { Header, Title } from '../projects/projectsList.styles';

export const Jobs = () => (
	<V5JobsOverrides>
		<Header>
			<Title>
				<FormattedMessage id="jobs.title" defaultMessage="Jobs" />
			</Title>
		</Header>
		<V4Jobs />
		<NewJobBottomButton>
			<AddCircleIcon />
			<FormattedMessage id="jobs.addJobButton" defaultMessage="Add new Job" />
		</NewJobBottomButton>
	</V5JobsOverrides>
);
