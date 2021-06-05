
import Airtable from 'airtable'

class Database {
  base: any
  constructor() {
    console.log(process.env)
    this.base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID || '')
  }
}

const db = new Database()
export default db

