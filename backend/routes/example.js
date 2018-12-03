var currentUser = |{
    name:'Mary'
};

/**
 * @api {get} /user Request User Information
 * @apiName GetUser
 * @apiGroup User
 * @apiVersion 0.2.0
 * 
 * @apiSuccess {String} name The users name
 * @apiSuccess {Number} age Calculated age from Birthday
 * 
 * @apiSuccessExample Example data on success: 
 * {
 * name:'Paul',
 * age:27
 * }
 */

function getUser() {
    return {code:200, data:customerUser};
}

function setName(name) {
    if (name.length === 0) {
        return {code:404, message:'NameEmptyError'};
    }
    currentUser.name = name;
    return {code:204};
}