//Controler de autenticação

const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')
const crypto = require('crypto')
const mailer = require('../modules/mailer')

const router = express.Router()

const generateToken = function(user){
    const token = jwt.sign({id: user.id}, authConfig.secret, {
        expiresIn: 86400
    })
    return token
}

router.post('/register', async (req, res) => {
    try{
        const {email} = req.body
        if (await User.findOne({email: email})){
            return res.status(400).send('error: User already exists')
        }
        const user = await User.create(req.body)
        user.password = undefined
        res.send({
            user, 
            token: generateToken(user)
        })
    }
    catch(err){
        res.status(400).send('error: Registration Failed')
    }
})

router.post('/authenticate', async (req, res) => {
    
    const {email, password} = req.body

    const user = await User.findOne({email: email}).select('+password')
    
    if(!user)
        return res.status(400).send('error: User not found')

    if (!await bcrypt.compare(password, user.password))
        res.status(400).send('error: Invalid password')

    user.password = undefined
    res.send({
        user, 
        token: generateToken(user)
    })
})

router.post('/forgot_password', async (req, res) => {
    const {email} = req.body

    try{
        const user = await User.findOne({email: email})
        if(!user)
            return res.status(400).send('error: User not found')

        const token = crypto.randomBytes(20).toString('hex')
        
        const now = new Date()
        now.setHours(now.getHours() + 1)
    
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })
        mailer.sendMail({
            to: email,
            from: 'marlonfleite50@gmail.com',
            template: 'auth/forgot_password',
            context: {
                token: token
            }
        }, (err) => {
            if(err){
                console.log(err)
                res.status(400).send('Error: Cannot send forgot password email')
            }
        })
        res.status(200).send('ok')
    }
    catch(e){
        res.status(400).send('Error: Error on forgot password, try again')
    }

})

router.post('/reset_password', async(req,res) => {
    const {email, token, password} = req.body

    try{
        const user = await User.findOne({email: email}).select('+passwordResetToken passwordResetExpires')
        
        if(!user)
            return res.status(400).send('error: User not found')
        
        if(token !== user.passwordResetToken){
            return res.status(400).send('Error: Invalid token')
        }
        
        const now = new Date()

        if(now > user.passwordResetExpires)
            return res.status(400).send('Error: Token expired, generate a new one')

        user.password = password

        await user.save()

        res.send('ok')

    }
    catch(e){
        res.status(400).send('Error: Cannot reset password, try again')
    }
})

module.exports = app => app.use('/auth', router)