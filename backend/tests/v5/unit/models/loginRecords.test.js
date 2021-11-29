 const { src } = require('../../helper/path');

 const _ = require('lodash');
 
 const db = require(`${src}/handler/db`);
 const { templates } = require(`${src}/utils/responseCodes`);
 const Strings  = require(`${src}/helpers/strings`);

 Strings.getLocationFromIPAddress.mockImplementation(() => { "United Kingdom", "London" });

 const LoginRecord = require(`${src}/models/loginRecord`);
 
 const testSaveLoginRecord = () => {    
     const checkResults = (fn, teamspace, arr, dataOverride) => {
         expect(fn.mock.calls.length).toBe(1);
         expect(fn.mock.calls[0][2]).toEqual({ user });
         expect(fn.mock.calls[0][3]).toEqual(determineAction(teamspace, arr, dataOverride));
     };
 
     describe('Add containers to favourites', () => {
         test('Should add favourite containers if the user has no favourites entry', async () => {
             jest.spyOn(db, 'findOne').mockResolvedValue({ customData: {} });
             const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
             const teamspace = 'teamspace3';
             const arr = ['e', 'f'];
             await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
             checkResults(fn, teamspace, arr, {});
         });
 
         test('Should add favourite containers under a new teamspace', async () => {
             jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
             const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
             const teamspace = 'teamspace3';
             const arr = ['e', 'f'];
             await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
             checkResults(fn, teamspace, arr);
         });
 
         test('Should add favourite containers on an existing teamspace', async () => {
             jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
             const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
             const teamspace = 'teamspace1';
             const arr = ['d', 'e'];
             await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
             checkResults(fn, teamspace, arr);
         });
 
         test('Should add favourite containers on an existing teamspace and ignore duplicate entries', async () => {
             jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
             const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
             const teamspace = 'teamspace1';
             const arr = ['a', 'b', 'c', ' d', 'e'];
             await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
             checkResults(fn, teamspace, arr);
         });
 
         test('Should return error when trying to add favourites to a user that doesnt exist', async () => {
             jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
             const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
             await expect(User.appendFavourites(user, 'teamspace3', ['e', 'f']))
                 .rejects.toEqual(templates.userNotFound);
             expect(fn.mock.calls.length).toBe(0);
         });
     });
 };
 
 
 describe('models/loginRecord', () => {
    testSaveLoginRecord();
 });
 