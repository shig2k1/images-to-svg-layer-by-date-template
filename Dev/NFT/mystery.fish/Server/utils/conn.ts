import express from 'express'
import socketio from 'socket.io'
import http from 'http'
import cors from 'cors'

class Conn {
  static _instance: any
  private _app: any
  private _http: any
  private _io: any

  constructor () {
    if (!Conn._instance) {
      this.create()

      Conn._instance = this;
    }

    return Conn._instance
  }

  public create () {    
    this._app = express()
    this._http = http.createServer(this._app)
    this._io = socketio(this._http)

    // allow JSON use
    this._app.use(express.json())
    // allow CORS
    this._app.use(cors())
  }
  get app() {
    return this._app
  }
  get http() {
    return this._http
  }
  get io() {
    return this._io
  }
}

const server = new Conn()
Object.freeze(server)

export default server
