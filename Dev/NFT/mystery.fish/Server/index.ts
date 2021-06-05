
import Database from './utils/db'

import HomeController from './controllers/home'

import conn from './utils/conn'

const PORT = 8000

const { http, io } = conn

// init routes within controllers
HomeController.InitRoutes()

http.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})

// socket.io
io.on('connection', (socket: any) => {
  console.log('a user connected FUCK YEAH!!!')
})

io.on('disconnection', (socket: any) => {
  console.log('a user disconnected')
})