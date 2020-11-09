/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { DialogActions } from '../../../../modules/dialog';
import { ModelActions } from '../../../../modules/model';
import { SnackbarActions } from '../../../../modules/snackbar';
import { selectIsStarredModel, StarredActions } from '../../../../modules/starred';
import { TeamspacesActions } from '../../../../modules/teamspaces';
import { selectSearchEnabled, ViewpointsActions } from '../../../../modules/viewpoints';
import { ModelGridItem } from './modelGridItem.component';

const mapStateToProps = createStructuredSelector({
	isStarred: selectIsStarredModel,
	searchEnabled: selectSearchEnabled,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	showDialog: DialogActions.showDialog,
	showConfirmDialog: DialogActions.showConfirmDialog,
	showRevisionsDialog: DialogActions.showRevisionsDialog,
	subscribeOnStatusChange: ModelActions.subscribeOnStatusChange,
	unsubscribeOnStatusChange: ModelActions.unsubscribeOnStatusChange,
	updateModel: TeamspacesActions.updateModel,
	removeModel: TeamspacesActions.removeModel,
	downloadModel: ModelActions.downloadModel,
	showSnackbar: SnackbarActions.show,
	addToStarred: StarredActions.addToStarredModels,
	removeFromStarred: StarredActions.removeFromStarredModels,
	setState: ViewpointsActions.setComponentState,
	shareViewpointLink: ViewpointsActions.shareViewpointLink,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ModelGridItem));
