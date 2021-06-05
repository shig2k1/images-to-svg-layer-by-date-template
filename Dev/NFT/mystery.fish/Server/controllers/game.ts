import { Request, Response, NextFunction } from 'express'

import conn from '../utils/conn'
import iRouteController from '../interfaces/iroutecontroller'

import GameModel from '../models/game'
import { checkJWT } from '../utils/auth'

const { app, io } = conn

function handleError (res: Response, err: any) {
  res.status(400)
     .send(err)
}


class GameController implements iRouteController {
  private ROOT = 'game'
  
  public InitRoutes() {
    // add routes to the app
    app.get(`/${this.ROOT}/`, this.root)

    //app.get(`/${this.ROOT}/create`, this.CreateGame)

    // create game
    app.post(`/${this.ROOT}/create`, this.CreateGame)

    // delete game
    app.delete(`/${this.ROOT}/:gameId`, this.DeleteGame)

    // player join game
    app.post(`/${this.ROOT}/:gameId/join`, this.PlayerJoinGame)

    // player leave game
    app.post(`/${this.ROOT}/:gameId/leave`, this.PlayerLeaveGame)

    // get game state
    app.get(`/secured`, checkJWT, this.Secured)
  }

  async root (req: Request, res: Response) {
    res.send('fuck your arse hair!')
    io.emit('msg', 'ho! - you love it!')
  }

  async Secured (req: Request, res: Response) {
    // read userId from auth middleware
    const { id, username } = res.locals.jwtPayload

    res.send(`${id} ${username}`)
  }

  async CreateGame (req: Request, res: Response) {
    const created = Date.now()
    const { owner } = req.body
    if (!owner) return res.status(400)
                          .send('Owner required')
    try {
      const gameModel = new GameModel({
        created,
        players: [
          owner
        ],
        owner
      })
      const game = gameModel.save()
      res.send(game)
    } catch(err) {
      res.status(400)
         .send(err)
    }
    res.send('yo!')
  }

  async DeleteGame (req: Request, res: Response) {
    const { gameId } = req.params
    try {
      await GameModel.deleteOne({ _id: gameId })
      res.status(200)
         .send('ok')
    } catch (err) {
      console.log('err', err)
      res.status(500)
         .send(err)
    }
  }

  async PlayerJoinGame (req: Request, res: Response) {
    const { playerId } = req.body
    const { gameId } = req.params
    // check required params
    if (!playerId) return res.status(400).send('missing parameters')
    // find the game
    const game = await GameModel.findById(gameId)
    if (!game) return res.status(400).send('game not found')
    const players = game.get('players')
    if (players.length >= 3) res.status(400).send('no free slots')
    // join game
    try {
      const update = await game.update({
        $addToSet: { 'players': playerId }
      })
      // console.log('game', game)
      res.status(200)
        .send(update)
        .send(`${playerId} joined game ${gameId}`)
    } catch (err) {
      return handleError(res, err)
    }
  }

  async PlayerLeaveGame (req: Request, res: Response) {
    const { playerId } = req.body
    const { gameId } = req.params
    // check required params
    if (!playerId) return res.status(400).send('missing parameters')
    // find the game
    try {
      // find and update the data in the game without first loading and modifying it
      // removes player from players array
      const game: any = await GameModel.findByIdAndUpdate(gameId, { $pull: { 'players': playerId } })
      // game returns the value of document BEFORE update has happened

      console.log('game', game)
      res.status(200)
        .send(game)
        .send(`${playerId} left game ${gameId}`)
    } catch (err) {
      return handleError(res, err)
    }
  }
}

const gameController = new GameController()
export default gameController
