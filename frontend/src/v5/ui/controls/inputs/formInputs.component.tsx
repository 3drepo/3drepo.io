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

import { ChipSelect } from '@controls/chip/chipSelect/chipSelect.component';
import { DueDateWithIcon } from '@controls/dueDate/dueDateWithIcon/dueDateWithIcon.component';
import { forwardRef } from 'react';
import { AssigneesSelect } from '@controls/assigneesSelect/assigneesSelect.component';
import { SearchSelect } from '@controls/searchSelect/searchSelect.component';
import { Checkbox } from './checkbox/checkbox.component';
import { DatePicker } from './datePicker/datePicker.component';
import { DateTimePicker } from './datePicker/dateTimePicker.component';
import { InputController, InputControllerProps } from './inputController.component';
import { MultiSelect } from './multiSelect/multiSelect.component';
import { NumberField } from './numberField/numberField.component';
import { PasswordField } from './passwordField/passwordField.component';
import { Select } from './select/select.component';
import { SelectView } from './selectView/selectView.component';
import { TextArea } from './textArea/textArea.component';
import { TextAreaFixedSize } from './textArea/textAreaFixedSize.component';
import { TextField } from './textField/textField.component';
import { ColorPicker } from './colorPicker/colorPicker.component';


// text inputs
export const FormNumberField = (props: InputControllerProps<typeof NumberField>) => (<InputController Input={NumberField} {...props} />);
export const FormPasswordField = (props: InputControllerProps<typeof PasswordField>) => (<InputController Input={PasswordField} {...props} />);
export const FormTextField = (props: InputControllerProps<typeof TextField>) => (<InputController Input={TextField} {...props} />);
export const FormTextArea = (props: InputControllerProps<typeof TextArea>) => (<InputController Input={TextArea} {...props} />);
export const FormTextAreaFixedSize = forwardRef((props: InputControllerProps<typeof TextAreaFixedSize>, ref) => (<InputController Input={TextAreaFixedSize} {...props} ref={ref} />));

// calendar inputs
export const FormDatePicker = (props: InputControllerProps<typeof DatePicker>) => (<InputController Input={DatePicker} {...props} />);
export const FormDateTimePicker = (props: InputControllerProps<typeof DateTimePicker>) => (<InputController Input={DateTimePicker} {...props} />);
export const FormDueDateWithIcon = (props: InputControllerProps<typeof DueDateWithIcon>) => (<InputController Input={DueDateWithIcon} {...props} />);

// select inputs
export const FormMultiSelect = (props: InputControllerProps<typeof MultiSelect>) => (<InputController Input={MultiSelect} {...props} />);
export const FormSelectView = (props: InputControllerProps<typeof SelectView>) => (<InputController Input={SelectView} {...props} />);
export const FormSelect = (props: InputControllerProps<typeof Select>) => (<InputController Input={Select} {...props} />);
export const FormChipSelect = (props: InputControllerProps<typeof ChipSelect>) => (<InputController Input={ChipSelect} {...props} />);
export const FormColorPicker = (props: InputControllerProps<typeof ColorPicker>) => (<InputController Input={ColorPicker} {...props} />);
export const FormAssigneesSelect = (props: InputControllerProps<typeof AssigneesSelect>) => (<InputController Input={AssigneesSelect} {...props} />);
export const FormSearchSelect = (props: InputControllerProps<typeof SearchSelect>) => (<InputController Input={SearchSelect} {...props} />);

// control inputs
export const FormCheckbox = (props: InputControllerProps<typeof Checkbox>) => (<InputController Input={Checkbox} {...props} />);
