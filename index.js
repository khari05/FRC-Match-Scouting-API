const { Pool } = require("pg")
const axios = require("axios").default
const express = require("express")
const cors = require("cors")

const TBAKey = process.env.TBAKEY

const app = express()
const pool = new Pool({
  connectionString: process.env.CONNECTIONSTRING,
  max: 1,
})

app.use(express.json(), cors(), express.urlencoded({ extended: true }))

const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log("App now running on port", port)
})

app.get("/events", function (req, response) {
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query("SELECT * FROM event")
        response.json(result.rows)
      } finally {
        client.release()
      }
    })
    .catch(e => console.error(e.stack))
}) 

app.get("/matches/:eventid", function (req, response) {
  const eventid = req.params.eventid
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query("SELECT match.* FROM match INNER JOIN event ON match.eventid = event.id WHERE event.blue_alliance_id = $1", [eventid])
        response.json(result.rows)
      } finally {
        client.release()
      }
    })
    .catch(e => console.error(e.stack))
})

app.get("/scout/:teamNumber/:matchid", function (req, response) {
  const matchid = parseInt(req.params.matchid)
  const teamNumber = parseInt(req.params.teamNumber)
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query("SELECT * FROM team_match_stat WHERE matchid = $1 AND team_number = $2", [matchid, teamNumber])
        response.json(result.rows[0])
      } finally {
        client.release()
      }
    })
    .catch(e => console.error(e.stack))
})

app.post("/scout/:teamNumber/:matchid", function (req, response) {
  const matchid = parseInt(req.params.matchid)
  const teamNumber = parseInt(req.params.teamNumber)
  const data = req.body.data
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query("SELECT COUNT(*) FROM team_match_stat WHERE matchid = $1 AND team_number = $2", [matchid, teamNumber])
        if (result.rows[0].count === "0") {
          await client.query("INSERT INTO team_match_stat (team_number, matchid, data) VALUES ($1, $2, $3)", [teamNumber, matchid, data]) // need to INSERT a row
        } else if (result.rows[0].count === "1" ) {
          await client.query("") // need to UPDATE a row
        } else {
          console.error(`count is ${result.rows[0].count}`)
        }
          response.json("action executed")
      } finally {
        client.release()
      }
    })
    .catch(e => console.error(e.stack))
})