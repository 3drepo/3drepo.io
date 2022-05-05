import * as Yup from 'yup';
import { formatMessage } from '../services/intl';

export const FederationCreationSchema = Yup.object().shape({
	name: Yup.string()
		.min(2,
			formatMessage({
				id: 'federations.creation.name.error.min',
				defaultMessage: 'Federation Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'federations.creation.name.error.max',
				defaultMessage: 'Federation Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'federations.creation.name.error.required',
				defaultMessage: 'Federation Name is a required field',
			}),
		),
	unit: Yup.string().required().default('mm'),
	code: Yup.string()
		.max(50,
			formatMessage({
				id: 'federations.creation.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(/^[A-Za-z0-9]*$/,
			formatMessage({
				id: 'federations.creation.code.error.characters',
				defaultMessage: 'Code can only consist of letters and numbers',
			})),
	desc: Yup.string()
		.max(50,
			formatMessage({
				id: 'federations.creation.desc.error.max',
				defaultMessage: 'Federation Description is limited to 50 characters',
			})),
});
