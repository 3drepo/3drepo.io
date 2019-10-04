/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Button from '@material-ui/core/Button';
import React from 'react';
import { ROUTES } from '../../../../constants/routes';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../../../services/analytics';
import { DATE_TIME_FORMAT } from '../../../../services/formatting/formatDate';
import { Loader } from '../../../components/loader/loader.component';
import { DateTime } from './../../../components/dateTime/dateTime.component';
import {
	Description,
	Item,
	LoaderContainer,
	Message,
	Property,
	PropertyWrapper,
	Row,
	StyledDialogActions,
	StyledDialogContent,
	StyledList
} from './revisionsDialog.styles';

interface IProps {
	fetchModelRevisions: (teamspace, modelId) => void;
	handleClose: () => void;
	revisions: any[];
	teamspace: string;
	modelId: string;
	location: any;
	history: any;
	isPending: boolean;
}

export class RevisionsDialog extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		this.props.fetchModelRevisions(this.props.teamspace, this.props.modelId);
	}

	public revisionClickHandler = ({ tag, _id }) => () => {
		const { teamspace, modelId, handleClose, history } = this.props;

		handleClose();
		history.push(`${ROUTES.VIEWER}/${teamspace}/${modelId}/${tag || _id}`);

		analyticsService.sendEvent(EVENT_CATEGORIES.MODEL, EVENT_ACTIONS.VIEW);
	}

	public get noRevisions() {
		return this.props.revisions.length === 0;
	}

	public render() {
		const { handleClose, revisions, isPending } = this.props;

		return (
			<StyledDialogContent>
				{isPending &&
					<LoaderContainer>
						<Loader content="Loading revisions..." />
					</LoaderContainer>
				}
				{ !isPending &&
				(this.noRevisions ?
					<Message>No Revisions Present</Message>
					:
					<>
						<StyledList>
							{revisions && revisions.map((revision, index) => (
								<Item
									button
									key={revision._id}
									divider
									onClick={this.revisionClickHandler(revision)}
									last={index === 0 ? 1 : 0}>
										<Row>
											<PropertyWrapper>
												<Property width="160">
													{revision.tag ? revision.tag : '(no tag)'}
												</Property>
												<Property>
													{revision.author}
												</Property>
											</PropertyWrapper>
											<Property>
												<DateTime value={revision.timestamp} format={DATE_TIME_FORMAT} />
											</Property>
										</Row>
										<Description>{revision.desc ? revision.desc : '(no description)'}
									</Description>
								</Item>)
							) }
						</StyledList>
					</>
				)}
				<StyledDialogActions>
					<Button variant="raised" color="secondary" onClick={handleClose}>
						Cancel
					</Button>
				</StyledDialogActions>
			</StyledDialogContent>
		);
	}
}
