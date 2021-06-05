import { Request, Response } from 'express'

import conn from '../utils/conn'
import iRouteController from '../interfaces/iroutecontroller'

import PlayerModel, { IPlayer } from '../models/player'
import { signJWT, hashPassword } from '../utils/auth'

const { app, io } = conn

function handleError (res: Response, err: any) {
  res.status(400)
     .send(err)
}

function BadRequest(res: Response, message: string) {
  return res.status(400).send(message)
}

class AuthController implements iRouteController {
  public InitRoutes() {
    // add routes to the app
    app.post(`/login`, this.Login)
  }

  async Login (req: Request, res: Response) {
    const { username, password } = req.body
    if (!username || !password) return BadRequest(res, 'username & password required')
    // Look for user matching supplied details
    const hashedPassword = await hashPassword(password)
    console.log('pwd', hashedPassword)
    const user = await PlayerModel.findOne({ 
      username: username.toLowerCase()
    })
    // User found?
    if (!user) return BadRequest(res, 'no user found')
    try {
      // comparePassword function added to PlayerModel schema
      user.comparePassword(password, (err: any, match: any) => {
        if (!match) {
          return res.send(401)
        }
        // User exists
        const { _id } = user
        // create a Json Web Token
        const token = signJWT(_id, username)
        console.log('token', token, _id)
        // return the token
        res.status(200).send({ access_token: token })
      })
    } catch (err) {
      return handleError(res, err)
    }
  }

}

export default new AuthController()
