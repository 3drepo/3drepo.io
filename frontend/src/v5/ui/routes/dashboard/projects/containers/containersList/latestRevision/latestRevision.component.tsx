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

import React from 'react';
import { ContainerStatuses } from '@/v5/store/containers/containers.types';
import { Trans } from '@lingui/react';
import { Name, ProcessingStatus, QueuedStatus } from './latestRevision.styles';

interface ILatestRevision {
	name: string;
	status: ContainerStatuses;
}

export const LatestRevision = ({ name, status }: ILatestRevision): JSX.Element => (
	<>
		<Trans
			id="containers.list.item.latestRevision.label"
			message="Latest revision: "
		/>
		{(() => {
			if (status === ContainerStatuses.QUEUED) {
				return (
					<QueuedStatus>
						<Trans id="containers.list.item.latestRevision.status.queued" message="Queued" />
					</QueuedStatus>
				);
			}

			if (status === ContainerStatuses.PROCESSING) {
				return (
					<ProcessingStatus>
						<Trans id="containers.list.item.latestRevision.status.processing" message="Processing" />
					</ProcessingStatus>
				);
			}

			return (
				<Name>
					{name}
				</Name>
			);
		})()}
	</>
);
