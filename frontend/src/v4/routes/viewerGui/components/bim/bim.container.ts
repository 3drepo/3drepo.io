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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import {
	selectActiveMeta,
	selectFilteredMetadata,
	selectIsPending,
	selectSearchEnabled,
	selectSelectedFilters,
	selectShowStarred,
	BimActions
} from '../../../../modules/bim';
import { DialogActions } from '../../../../modules/dialog';
import { selectMetaKeys } from '../../../../modules/model';
import { selectStarredMeta, StarredActions } from '../../../../modules/starred';
import { Bim } from './bim.component';

const mapStateToProps = createStructuredSelector({
	metadata: selectFilteredMetadata,
	starredMetaMap: selectStarredMeta,
	searchEnabled: selectSearchEnabled,
	selectedFilters: selectSelectedFilters,
	showStarred: selectShowStarred,
	metaKeys: selectMetaKeys,
	isPending: selectIsPending,
	activeMeta: selectActiveMeta
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchMetadata: BimActions.fetchMetadata,
	setComponentState: BimActions.setComponentState,
	clearStarredMetadata: StarredActions.clearStarredMeta,
	addMetaRecordToStarred: StarredActions.addToStarredMeta,
	removeMetaRecordFromStarred: StarredActions.removeFromStarredMeta,
	showConfirmDialog: DialogActions.showConfirmDialog,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Bim) as any;
