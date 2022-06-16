/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { CentredContainer } from '@controls/centredContainer';
import { FormattedMessage } from 'react-intl';
import { Heading, NoRevisionBackground, Subheading } from './noRevisionOverlay.styles';

type INoRevision = {
	isProcessing: boolean;
	isContainer: boolean;
};

export const NoRevisionOverlay = ({ isProcessing, isContainer }: INoRevision) => {
	const viewType = isContainer ? 'Container' : 'Federation';

	const containerMessage = () => (isProcessing ? (
		formatMessage({
			id: 'noRevisionOverlay.subheading.container.processing',
			defaultMessage: 'The Container is empty, you\'ll need to wait for the Container to finish processing.',
		})
	) : (
		formatMessage({
			id: 'noRevisionOverlay.subheading.container.notProcessing',
			defaultMessage: 'You\'ll need to upload a new revision.',
		})
	));

	return (
		<NoRevisionBackground>
			<CentredContainer>
				<Heading>
					<FormattedMessage
						id="noRevisionOverlay.heading"
						defaultMessage={`The ${viewType} is empty`}
					/>
				</Heading>
				<Subheading>
					{
						isContainer ? containerMessage() : (
							<FormattedMessage
								id="noRevisionOverlay.subheading.revision"
								defaultMessage="You'll need to add a container"
							/>
						)
					}
				</Subheading>
			</CentredContainer>
		</NoRevisionBackground>
	);
};
