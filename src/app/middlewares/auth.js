const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization

    if(!authHeader)
        return res.status(401).send('Error: no token provider')

    //bearer 123laksfjlksfj
    const parts = authHeader.split(' ')

    if(parts.length != 2)
        return res.status(401).send('Error: token error')

    const [scheme, token] = parts

    console.log(token)

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send('Error: token malformatted')
    
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(401).send('Error: token invalid')

        req.userId = decoded.id //passa para a request o id do usuário
        next()
    })
    

}