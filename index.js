const { Pool } = require("pg")
const axios = require("axios").default
const express = require("express")
const cors = require("cors")

const TBAKey = process.env.TBAKEY

const app = express()
const pool = new Pool({
  connectionString: process.env.CONNECTIONSTRING
})

app.use(express.json(), cors(), express.urlencoded({ extended: true }))

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port
  console.log("App now running on port", port)
})

app.get("/events", function (req, response) {
  pool
    .connect()
    .then(client => {
      return client
        .query("SELECT * FROM event")
        .then(result => {
          client.release()
          response.json(result.rows)
        })
    })
    .catch(e => console.error(e.stack))
})
app.get("/matches/:eventid", function (req, response) {
  const eventid = req.params.eventid
  pool
    .connect()
    .then(client => {
      return client
        .query("SELECT match.* FROM match INNER JOIN event ON match.eventid = event.id WHERE event.blue_alliance_id = $1", [eventid])
        .then(result => {
          client.release()
          response.json(result.rows)
        })
    })
    .catch(e => console.error(e.stack))
})
app.get("/scout/", function (req, response) {
  const matchid = parseInt(req.headers.matchid)
  const teamNumber = parseInt(req.headers.team_number)
  pool
    .connect()
    .then(client => {
      return client
        .query(
          "SELECT team_match_stat.* FROM match INNER JOIN team_match_stat ON match.id = team_match_stat.matchid WHERE matchid = $1 AND team_number = $2",
          [matchid, teamNumber]
        )
        .then(result => {
          client.release()
          response.json(result.rows)
        })
    })
    .catch(e => console.error(e.stack))
})