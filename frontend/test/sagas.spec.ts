import { AuthActions } from '@/v5/store/auth/auth.redux';
import * as AuthSaga from '@/v5/store/auth/auth.sagas';
import { expectSaga } from 'redux-saga-test-plan';

describe('Auth sagas', () => {

	it('should dispatch login success', () => {
		return expectSaga(AuthSaga.default)
			// Assert that the `put` will eventually happen.
			.dispatch(AuthActions.login('stuff', 'pass'))
			// Dispatch any actions that the saga will `take`.
			.put(AuthActions.loginSuccess())
			// Start the test. Returns a Promise.
			.silentRun();
	})

});
