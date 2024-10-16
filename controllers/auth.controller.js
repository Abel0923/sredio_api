const passport = require('passport');
const users = require('../models/github-integration.model');

exports.githubAuth = passport.authenticate('github', { scope: ['user:email'] });
exports.githubCallback = async (req, res) => {

    try{
        let { user } = req
        if(user){
            console.log("REQ>> ", req.session)
            let { profile,accessToken } = user
            let { id, displayName, username, lastLogin } = profile
            let userData = await new users({id, displayName, username, lastLogin, accessToken}).save()
            res.redirect(`http://localhost:4200/?token=${accessToken}`);
        }
        
    }catch(_err){
        console.log("_ERR >> ", _err)
        return res.status(400).json({message: "Something went wrong"})
    }
};

exports.userAuth = async (req, res, next) => {

    console.log("============ USER AUTH ===============")
    let {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({message: "Unauthorized"})
    }
    let token = authorization.substring(6, authorization.length)
    console.log("Toekn >> ", token)
    let user = await users.findOne({accessToken: token})
    if(!user){
        return res.status(400).json({message: "You are not connected!"})
    }
    console.log("User >> ", user)
    return res.status(200).json(user)
}

exports.deleteAuthUser = async (req, res, next) => {
    console.log("============ USER DELETE AUTH ===============")

    let {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({message: "Unauthorized"})
    }
    let token = authorization.substring(6, authorization.length)
    
    return await users.findOneAndDelete({accessToken: token})
        .then(_res => {
            return res.status(200).json({message: "User Removed Successfully!"})
        }).catch(_err => {
            console.log("ERR >> ", _err)
            return res.status(400).json({message: "Something went wrong"})
        })
}

