/**
 * @name                - Gennode Authorization Middleware
 * @description         - Middle ware for gennode authorization service
 * @param req           - Request Object
 * @param res           - Response Object
 * @param next          - Next
 */


class GennodeAuthorizationMiddleware {

    /**
     * @name                    - Constructor
     * @description             - Gennode authorization middleware constructor
     * @param config            - User configuration
     * @example
     * {
            authEndPoint    : "http://localhost:3400/auth/token/validate",
            message         : {
                authorized      : "Access Granted", // Code 401
                notAuthorized   : "Access Denied"   // Code 200
            },
            accessObject    : {
                body : ["_id","id"],
                url  : ["_id","id"]
            }
        }
     */
    constructor(config){
        this.async      = require('async');
        this.debug      = require('debug')('Gennode-Authorization-Middleware');
        this.request    = require('request');
        this.xtend      = require('xtend');

        this.defaultConfig = {
            authEndPoint    : "http://localhost:3400/auth/token/validate",
            message         : {
                authorized      : "Access Granted", // Code 401
                notAuthorized   : "Access Denied"   // Code 200
            },
            accessObject    : {
                body : ["_id","id"],
                url  : ["_id","id"]
            }
        };


    }


}



module.exports = GennodeAuthorizationMiddleware;

