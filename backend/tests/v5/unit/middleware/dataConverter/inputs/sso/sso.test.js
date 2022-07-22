
 const { src } = require('../../../../../helper/path');
 const Sso = require(`${src}/middleware/dataConverter/inputs/sso`);

 const testAddPkceProtection = () => {   
     describe('Add pkce protection', () => {
		test('should generate pkce codes and assign them to req', async () => {
			const mockCB = jest.fn();
            const req = { session: {} };
			await Sso.addPkceProtection(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
            expect(req.session.pkceCodes.challengeMethod).toEqual('S256');
            expect(req.session.pkceCodes).toHaveProperty('verifier');
            expect(req.session.pkceCodes).toHaveProperty('challenge');
        });
	});
 };
 
 describe('middleware/dataConverter/inputs/sso', () => {
    testAddPkceProtection();
 });
 