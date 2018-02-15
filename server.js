import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import dotenv from 'dotenv'

export default class Server {
  constructor() {
    dotenv.config()
  }
  
  setup() {
    const app = express()
    const PORT = process.env.PORT || 3001;
  
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
  
    this._setupRoutes(app);

    app.listen(PORT, () => console.log(`Start on http://localhost:${PORT}`))
  }

  _setupRoutes(app) {
    const APP_DIR = `${__dirname}/App`
    const features = fs.readdirSync(APP_DIR).filter(
      file => fs.statSync(`${APP_DIR}/${file}`).isDirectory()
    )
  
    features.forEach(feature => {
      const router = express.Router()
      const routes = require(`${APP_DIR}/${feature}/routes.js`)
  
      routes.setup(router)
      app.use(`/${feature}`, router)
    })
  }
}
