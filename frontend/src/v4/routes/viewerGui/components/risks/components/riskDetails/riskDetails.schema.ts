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
import { LONG_TEXT_CHAR_LIM } from '@/v4/constants/viewerGui';
import { VALIDATIONS_MESSAGES } from '@/v4/services/validation';
import * as Yup from 'yup';

export const RiskSchema = Yup.object().shape({
	desc: Yup.string().max(LONG_TEXT_CHAR_LIM, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	mitigation_desc: Yup.string().max(LONG_TEXT_CHAR_LIM, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	mitigation_detail: Yup.string().max(LONG_TEXT_CHAR_LIM, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	residual_risk: Yup.string().max(LONG_TEXT_CHAR_LIM, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});