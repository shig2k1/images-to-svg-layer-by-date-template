import { Request, Response } from 'express'
import conn from '../utils/conn'
import iRouteController from '../interfaces/iroutecontroller'
import PlayerModel from '../models/player'
import { checkJWT } from '../utils/auth'

const { app, io } = conn

class PlayerController implements iRouteController {
  private ROOT = 'player'
  public InitRoutes() {
    // get player by nickname
    app.get(`/${this.ROOT}/`, checkJWT, this.GetCurrentPlayer)

    // create player
    app.post(`/${this.ROOT}/`, this.createPlayer)
  }

  async root (req: Request, res: Response) {
    const players = await PlayerModel.find()

    res.send(players)
    io.emit('msg', 'ho! - you love it!')
  }

  async createPlayer (req: Request, res: Response) {
    const { username, password } = req.body
    if (!username || !password) return res
                            .status(400)
                            .send('username & password required')
    try {
      const playerModel = new PlayerModel({
        username: username.toLowerCase(),
        password
      })

      const r = await playerModel.save()

      res
        .send(r)
    } catch (err) {
      res
        .status(400)
        .send(err)
    }
  }

  async GetCurrentPlayer (req: Request, res: Response) {
    const { id, username } = res.locals.jwtPayload
    console.log('username', username)

    if (!username) return res.status(400)
                              .send('username required')
    // find player matching nickname
    const player = await PlayerModel.findOne({ username })

    if (player) return res.status(200)
                          .send(player)
    return res.status(404)
              .send(`Player not found with nickname: "${username}"`)
  }
}

const playerController = new PlayerController()
export default playerController
