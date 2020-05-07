const { Pool } = require("pg")
const axios = require("axios").default
const express = require("express")
const cors = require("cors")
const { convertMatches } = require("./util")

const TBAKey = process.env.TBAKEY
const instance = axios.create({
  baseURL: "https://thebluealliance.com/api/v3",
  timeout: 10000,
  headers: {
    "X-TBA-Auth-Key": TBAKey,
  }
})

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

app.post("/addevents", function (req, response) {
  const blueAllianceId = req.body.blue_alliance_id
  const eventName = req.body.event_name
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query("SELECT COUNT(*) FROM event WHERE blue_alliance_id = $1", [blueAllianceId])
        if (result.rows[0].count === "0") {
          await client.query("INSERT INTO event (name, blue_alliance_id) VALUES ($1, $2)", [eventName, blueAllianceId])
        }
        response.json("")
      } finally {
        client.release()
      }
    })
    .catch(e => console.log(e.stack))
})

app.get("/matches/:eventid", function (req, response) {
  const eventid = req.params.eventid
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query("SELECT match.* FROM match INNER JOIN event ON match.eventid = event.id WHERE event.blue_alliance_id = $1", [eventid])
        response.json(result.rows.sort((a, b) => a.match_number-b.match_number))
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
          await client.query("UPDATE team_match_stat SET data=$3 WHERE team_number = $1 AND matchid = $2", [teamNumber, matchid, data]) // need to UPDATE a row
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

app.put("/pullmatches/:eventkey", function (req, response) {
  const eventKey = req.params.eventkey
  pool
    .connect()
    .then(async client => {
      try {
        const matches = (await instance.get(`/event/${eventKey}/matches/simple`)).data
        const result = await client.query("SELECT match.* FROM match INNER JOIN event ON match.eventid = event.id WHERE event.blue_alliance_id = $1", [eventKey])
        if (result.rowCount === 0) {
          const matchList = convertMatches(matches, result.rows[0])
          console.table(matchList)
          for (i in matchList) {
            await client.query("INSERT INTO match (eventid, blue1, blue2, blue3, red1, red2, red3, match_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", matchList[i])
          }
          response.json("action executed")
        } else {
          console.error(`error, eventKey ${eventKey} already has matches`)
          response.json(`error, eventKey ${eventKey} already has matches`)
        }
      } finally {
        client.release()
      }
    })
    .catch(e => console.error(e.stack))
})