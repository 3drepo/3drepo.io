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
import { i18n } from '@lingui/core';
import { ErrorTooltip } from '@controls/errorTooltip';
import { Name, ProcessingStatus, QueuedStatus } from './latestRevision.styles';

interface ILatestRevision {
	name: string;
	status: ContainerStatuses;
	selected?: boolean;
	error?: {
		date: Date;
		message: string;
	}
}

export const LatestRevision = ({ name, status, selected = false, error }: ILatestRevision): JSX.Element => (
	<>
		<Trans
			id="containers.list.item.latestRevision.label"
			message="Latest revision: "
		/>
		{(() => {
			if (status === ContainerStatuses.QUEUED) {
				return (
					<QueuedStatus selected={selected}>
						<Trans id="containers.list.item.latestRevision.status.queued" message="Queued" />
					</QueuedStatus>
				);
			}

			if (status === ContainerStatuses.PROCESSING) {
				return (
					<ProcessingStatus selected={selected}>
						<Trans id="containers.list.item.latestRevision.status.processing" message="Processing" />
					</ProcessingStatus>
				);
			}

			if (status === ContainerStatuses.FAILED && error) {
				return (
					<>
						<Name>
							{name}
						</Name>
						<ErrorTooltip>
							<Trans
								id="containers.list.item.latestRevision.status.error.tooltipMessage"
								message="The latest upload on <0>{date}</0> at <0>{time}</0> has failed due to <0>{message}</0>."
								values={{
									date: i18n.date(error.date),
									time: i18n.date(error.date, {
										hour: 'numeric',
										minute: 'numeric',
									}),
									message: error.message,
								}}
								components={[
									<b />,
								]}
							/>
						</ErrorTooltip>
					</>
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
