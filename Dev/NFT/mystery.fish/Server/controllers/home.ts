import e, { Request, Response } from 'express'
import conn from '../utils/conn'
import iRouteController from '../interfaces/iroutecontroller'

const { app, io } = conn

import db from '../utils/db'

import fs from 'fs'

class HomeController implements iRouteController {
  constructor () {
  }

  public InitRoutes() {
    app.get(`/`, this.fishController)
  }

  // temporarily use the local data to save on requests to the airtable api
  async fishController (req: Request, res: Response) {
    const rawData = await fs.readFileSync('./data/fish-data.json')
    const fish = JSON.parse(rawData.toString())
    res.json(fish)
  }

  async homeController (req: Request, res: Response) {
    let fish:any[] = []

    await db.base('Breeding Table').select({
      filterByFormula: 'Status = "minted"',
      /*sort: [{ field: 'DOB', direction: 'asc' }],*/
      // get the last record
      maxRecords: 1000,
      view: "Grid view"
    }).eachPage(function page(records: any, fetchNextPage: any) {
      fish = [
        ...fish,
        ...records
      ]

      fetchNextPage();
    })

    // transform the data
    const newData = fish.map(f => f.fields)

    res.json(newData)
  }
}

const homeController = new HomeController()
export default homeController
