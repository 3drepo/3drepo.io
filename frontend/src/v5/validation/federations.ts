import * as Yup from 'yup';

export const FederationCreationSchema = Yup.object().shape({
	name: Yup.string(),
});
