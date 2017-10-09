/**
 * @api {get} /pots List all pots
 * @apiName GetPots
 * @apiGroup Pot
 * @apiVersion 1.0.0
 *
 * @apiSuccess {Object[]} pots Pot's list (Array of Object).
 * @apiSuccess {ObjectId} pots._id Id of de pot.
 * @apiSuccess {String} pots.name Name of the plant in the pot.
 * @apiSuccess {Number} pots.humidity Actual humidity of the pot.
 * @apiSuccess {Number} pots.moisture Actual moisture of the pot.
 * @apiSuccess {Number} pots.roomTemperature Actual room temperature of the pot.
 * @apiSuccess {Number} pots.temperature Actual temperature of the pot.
 * @apiSuccess {ObjectId} pots.owner Id reference to the user who owns the pot.
 * @apiSuccess {ObjectId[]} pots.watchers List of id referencing to the users who are watching the pot (Array of ObjectId).
 * @apiSuccess {ObjectId[]} pots.requests List of id referencing to the users who are requesting to watch the pot (Array of ObjectId).
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *          "_id": "59d05fa98c737c082b26f795",
 *          "name": "Maceta",
 *          "humidity": 0,
 *          "moisture": 0,
 *          "roomTemperature": 0,
 *          "temperature": 0,
 *          "owner": "59d0672f52b92708727fa88e",
 *          "watchers": [
 *              "59d0ad97e77f0e097199bba8"
 *          ],
 *          "requests": []
 *      }
 *    ]
 * @apiSuccessExample Success (No pots):
 *     HTTP/1.1 200 OK
 *     {
 *      "message": "No existen pots"
 *     }
 *
 * @apiErrorExample Error:
 *     HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {get} /pots/:potId Get a pot by its Id
 * @apiName GetPotsWithId
 * @apiGroup Pot
 * @apiVersion 1.0.0
 *
 * @apiSuccess {Object} pots Pot with its atributes.
 * @apiSuccess {ObjectId} pots._id Id of de pot.
 * @apiSuccess {String} pots.name Name of the plant in the pot.
 * @apiSuccess {Number} pots.humidity Actual humidity of the pot.
 * @apiSuccess {Number} pots.moisture Actual moisture of the pot.
 * @apiSuccess {Number} pots.roomTemperature Actual room temperature of the pot.
 * @apiSuccess {Number} pots.temperature Actual temperature of the pot.
 * @apiSuccess {ObjectId} pots.owner Id reference to the user who owns the pot.
 * @apiSuccess {ObjectId[]} pots.watchers List of id referencing to the users who are watching the pot (Array of ObjectId).
 * @apiSuccess {ObjectId[]} pots.requests List of id referencing to the users who are requesting to watch the pot (Array of ObjectId).
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *      {
 *      "pot": {
 *      "_id": "59d2afb1c2ec6933511c41f2",
 *      "__v": 0,
 *        "requests": [],
 *        "watchers": [],
 *        "temperature": 0,
 *        "roomTemperature": 0,
 *        "moisture": 0,
 *        "humidity": 0,
 *        "name": "Maceta"
 *       }
 *     }
 * @apiSuccessExample Success (No pots):
 *     HTTP/1.1 200 OK
 *     {
 *      "message": "No existen pots"
 *     }
 *
 * @apiErrorExample Error:
 *     HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {post} /pot create a new pot
 * @apiName PostPot
 * @apiGroup Pot
 * @apiVersion 1.0.0
 *
 * @apiSuccess {Number} pots.__v variable not used.
 * @apiSuccess {ObjectId} pots._id Pot id.
 * @apiSuccess {ObjectId[]} pots.requests List of id users who are requesting to watch a pot (Empty Array of ObjectId)
 * @apiSuccess {ObjectId[]} pots.watchers List of id users who are watching a pot (Empty Array of ObjectId)
 * @apiSuccess {String} pots.name Plant's name in the pot.
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *    {
 *      "pot": {
 *      "__v": 0,
 *      "_id": "59d97a557349721117dcc7f0",
 *      "requests": [],
 *      "watchers": [],
 *      "name": "Maceta"
 *        }
 *      }
 *
 * @apiSuccessExample Sucess (No pot)
 *  HTTP/1.1 200 OK
 *    {message: "no existen pots"}
 *
 * @apiErrorExample Error:
 *     HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {put} /pots/:potId update a pot
 * @apiName UpdatePot
 * @apiGroup Pot
 * @apiVersion 1.0.0
 *
 * @apiSuccess {Object} pots Pot with updated atributes.
 * @apiSuccess {ObjectId} pots._id Id of de pot.
 * @apiSuccess {Number} pots.__v variable not used.
 * @apiSuccess {ObjectId[]} pots.watchers List of id referencing to the users who are watching the pot (Array of ObjectId).
 * @apiSuccess {ObjectId[]} pots.requests List of id referencing to the users who are requesting to watch the pot (Array of ObjectId).
 * @apiSuccess {Number} pots.humidity Actual humidity of the pot.
 * @apiSuccess {Number} pots.moisture Actual moisture of the pot.
 * @apiSuccess {Number} pots.roomTemperature Actual room temperature of the pot.
 * @apiSuccess {Number} pots.temperature Actual temperature of the pot.
 * @apiSuccess {String} pots.name Name of the plant in the pot.
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * {
 *    "pot": {
 *      "_id": "59d2afb1c2ec6933511c41f2",
 *        "__v": 0,
 *        "requests": [],
 *        "watchers": [],
 *        "temperature": 0,
 *        "roomTemperature": 0,
 *        "moisture": 0,
 *        "humidity": 0,
 *        "name": "Maceta"
 *    }
 * }
 * @apiSuccessExample Success (No pots):
 *     HTTP/1.1 200 OK
 *     {
 *      "message": "No existen pots"
 *     }
 *
 * @apiErrorExample Error:
 *     HTTP/1.1 500 Internal Server Error
 */
/**
 * @api {delete} /pots/:potId Delete a pot
 * @apiName DeletePot
 * @apiGroup Pot
 * @apiVersion 1.0.0
 *
 *@apiSuccessExample
 *  HTTP/1.1 200 OK
 * {
 *    "message": "El pot ha sido eliminado"
 * }
 *
 *@apiSuccessExample Sucess (No pot)
 *  HTTP/1.1 200 OK
 * {message:"no exiten pots"}
 *
 *@apiErrorExample
 *     HTTP/1.1 500 Internal Server Error
 */
 /**
 *@api {get pots by owner} /users/:userId/owner/pots List all pots owned by a user
 *@apiName GetOwnedPots
 *@apiGroup User
 *@apiVersion 1.0.0
 *
 *@apiSuccess {ObjectId[]} pots_id List of all pots ID owned by a user
 *@apiSuccessExample
 *    HTTP/1.1 200 OK
 *    {
 *      pots = []
 *    }
 *
 *@apiSuccessExample Sucess (No Pots)
 *    HTTP/1.1 200 OK
 * { message: 'No existen pots' }
 *
 *@apiErrorExample
 *    HTTP/1.1 500
 * { message: `Error al realizar petición: 500` }
 */
/**
 *@api {get pots by watcher} /users/:userId/watcher/pots List all pots watched by a user
 *@apiName GetWatchedPots
 *@apiGroup User
 *@apiVersion 1.0.0
 *
 *@apiSuccess {ObjectId[]} pots_id List of all pots ID watched by a user
 *@apiSuccessExample
 *    HTTP/1.1 200 OK
 *    {
 *       pots = []
 *         }
 *
 *@apiSuccessExample Sucess (No Pots)
 *    HTTP/1.1 200 OK
 * { message: 'No existen pots' }
 *
 *@apiErrorExample
 *    HTTP/1.1 500
 * { message: `Error al realizar petición: 500` }
 */
/**
 *@api {Update requests} /pots/:potId/requests/:requestId Update status of a request
 *@apiName UpdateRequestStatus
 *@apiGroup Pot
 *@apiVersion 1.0.0
 *
 *@apiSuccessExample
 *  HTTP/1.1 200
 * { pot: potUpdated }
 *
 *@apiErrorExample
 *  HTTP/1.1 500
 * { message: `Error al realizar petición: 500 }
 */
/**
 *@api {get users} /users Get list of all users
 *@apiName GetUsers
 *@apiGroup User
 *@apiVersion 1.0.0
 *
 *@apiSuccess {Object[]} user User's list (Array of object).
 *@apiSuccess {ObjectId} user.id User's ID.
 *@apiSuccess {String} user.email User's email.
 *@apiSuccess {String} user.name User's name.
 *@apiSuccess {String} user.password User's password.
 *@apiSuccess {String} user.phoneNumber User's phone number.

 @apiSuccessExample
 *  HTTP/1.1 200
 *    [
 *      {
 *        "id":
 *        "email": hola@hola.cl
 *        "name": holi
 *        "password": asdf123453
 *        "phoneNumber": 84930291
 *      }
 *      ]
 *
 *@apiSuccessExample Success (No users)
 *  HTTP/1.1 200
 *    { message: 'No existen usuarios' }
 *
 *@apiErrorExample
 *  HTTP/1.1 500
 * { message: `Error al realizar petición: 500` }
 */
/**
 *@api {get user}  /users/:userId Get a user by his Id
 *@apiName GetUser
 *@apiGroup User
 *@apiVersion 1.0.0
 *
 *@apiSuccess {Object[]} user User's list (Array of object).
 *@apiSuccess {ObjectId} user.id User's ID.
 *@apiSuccess {String} user.email User's email.
 *@apiSuccess {String} user.name User's name.
 *@apiSuccess {String} user.password User's password.
 *@apiSuccess {String} user.phoneNumber User's phone number.
 *
 *@apiSuccessExample
 *  HTTP/1.1 200
 *    {
 *      "user":
 *              {
 *                "id":
 *                "email": hola@hola.cl
 *                "name": holi
 *                "password": asdf123453
 *                "phoneNumber": 84930291
 *              }
 *      }
 *
 *@apiSuccessExample Success (No user)
 *  HTTP/1.1 200
 *    { message: 'El usuario no existe' }
 *
 *@apiErrorExample
 *  HTTP/1.1 500
 * { message: `Error al realizar petición: 500` }
 */
/**
 *@api {sign up} /signup Send data to create a new user.
 *@apiName SignUp
 *@apiGroup User
 *@apiVersion 1.0.0
 *
 *@apiSuccessExample
 *  HTTP/1.1 200
 *  {message: 'Usuario creado correctamente', user: user, token: tokenService.createToken(user)}
 *@apiErrorExample
 *  HTTP/1.1 500
 *    {message: `Error al crear usuario: 500`}
 */
/**
 *@api {sign in} /signin Send data to sign in.
 *@apiName SignIn
 *@apiGroup User
 *@apiVersion 1.0.0
 *
 *@apiSuccessExample
 *  HTTP/1.1 200
 * {
 *  message: 'Logueado correctamente',
 *  user: user,
 *  token: tokenService.createToken(user)
 *  }
 *
 *@apiSuccessExample Sucess (No user)
 * {message: 'No existe el usuario'}
 *
 *@apiSuccessExample Sucess (Wrong Username or Password)
 *  HTTP/1.1 401
 * {message: 'Usuario o contraseña incorrectos'}
 *
 *@apiErrorExample
 *  HTTP/1.1 500 Internal Server Error
 */
