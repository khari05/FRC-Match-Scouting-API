const { Pool } = require('pg')
const axios = require('axios').default
const express = require('express')
const cors = require('cors')
const path = require('path')
const { readFile } = require('fs').promises
const {
  convertMatches, convertTeams, convertTeamEvents, updateTeams,
  calculateElo
} = require('./util')

const TBAKey = process.env.TBAKEY
const bobbyTable = /^[A-Za-z0-9]*$/
const instance = axios.create({
  baseURL: 'https://thebluealliance.com/api/v3',
  timeout: 10000,
  headers: {
    'X-TBA-Auth-Key': TBAKey
  }
})

const app = express()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: {
    rejectUnauthorized: false
  }
})

app.use(express.json(), cors(), express.urlencoded({ extended: true }))

pool
  .connect()
  .then(async client => {
    try {
      const result = await client.query('SELECT * FROM information_schema.tables WHERE table_schema=$1', ['public'])
      if (result.rows.length !== 5) {
        client.query('CREATE TABLE public.event (id int4 NOT NULL GENERATED ALWAYS AS IDENTITY, name varchar(50) NULL, blue_alliance_id varchar(10) NULL ) CREATE TABLE public.match ( id int4 NOT NULL GENERATED ALWAYS AS IDENTITY, eventid int4 NULL, blue1 int4 NULL, blue2 int4 NULL, blue3 int4 NULL, red1 int4 NULL, red2 int4 NULL, red3 int4 NULL ) CREATE table public.team_match_stat ( id int4 NOT NULL GENERATED ALWAYS AS IDENTITY, matchid int4 NULL, team_number int4 NULL, data jsonb NULL ) CREATE TABLE public.team ( id int NOT NULL, team_name varchar(50) NULL CREATE table public.team_event ( id int4 NOT NULL GENERATED ALWAYS AS IDENTITY, eventid int4 NULL, team_number int4 NULL, data jsonb NULL )')
      }
      console.log('PostgreSQL server is configured correctly.')
    } finally {
      client.release()
    }
  })
  .catch(e => console.error(e.stack))

const server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port
  console.log('App now running on port', port)
})

app.get('/', async (req, res) => {
  res.send(
    await readFile(path.resolve(__dirname, './index.html'), 'utf8')
      .catch(e => console.error(e.stack))
  )
})

app.get('/events', (req, response) => {
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query('SELECT * FROM event')
        response.status(200).json(result.rows)
      } finally {
        client.release()
      }
    })
    .catch(e => console.error(e.stack))
})

app.post('/addevents', (req, response) => {
  const blueAllianceId = req.body.blue_alliance_id
  const eventName = req.body.event_name
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query('SELECT COUNT(*) FROM event WHERE blue_alliance_id = $1', [blueAllianceId])
        if (result.rows[0].count === '0') {
          await client.query('INSERT INTO event (name, blue_alliance_id) VALUES ($1, $2)', [eventName, blueAllianceId])
          response.status(201).json('action executed')
        }
      } finally {
        client.release()
      }
    })
    .catch(e => {
      response.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.get('/matches/:eventid', (req, response) => {
  const eventid = req.params.eventid
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query('SELECT match.* FROM match INNER JOIN event ON match.eventid = event.id WHERE event.blue_alliance_id = $1', [eventid])
        response.status(200).json(result.rows.sort((a, b) => a.match_number - b.match_number))
      } finally {
        client.release()
      }
    })
    .catch(e => {
      response.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.get('/teams/:eventKey', (req, res) => {
  const eventKey = req.params.eventKey
  pool
    .connect()
    .then(async client => {
      try {
        const teams = await client.query('SELECT * FROM team INNER JOIN event ON team.eventid = event.id WHERE event.blue_alliance_id = $1', [eventKey])
        res.status(200).json(teams.rows)
      } finally {
        client.release()
      }
    })
    .catch(e => {
      res.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.get('/scout/:teamNumber/:matchid', (req, response) => {
  const matchid = parseInt(req.params.matchid)
  const teamNumber = parseInt(req.params.teamNumber)
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query('SELECT * FROM team_match_stat WHERE matchid = $1 AND team_number = $2', [matchid, teamNumber])
        response.status(200).json(result.rows[0])
      } finally {
        client.release()
      }
    })
    .catch(e => {
      response.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.post('/scout/:teamNumber/:matchid', (req, response) => {
  const matchid = parseInt(req.params.matchid)
  const teamNumber = parseInt(req.params.teamNumber)
  const data = req.body.data
  pool
    .connect()
    .then(async client => {
      try {
        const result = await client.query('SELECT COUNT(*) FROM team_match_stat WHERE matchid = $1 AND team_number = $2', [matchid, teamNumber])
        if (result.rows[0].count === '0') {
          await client.query('INSERT INTO team_match_stat (team_number, matchid, data) VALUES ($1, $2, $3)', [teamNumber, matchid, data]) // need to INSERT a row
          response.status(201).json('action executed')
        } else if (result.rows[0].count === '1') {
          await client.query('UPDATE team_match_stat SET data=$3 WHERE team_number = $1 AND matchid = $2', [teamNumber, matchid, data]) // need to UPDATE a row
          response.status(201).json('action executed')
        } else {
          console.error(`count is ${result.rows[0].count}`)
          response.status(406).json(`error, count is ${result.rows[0].count}`)
        }
      } finally {
        client.release()
      }
    })
    .catch(e => {
      response.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.get('/team/:teamNumber/:eventKey', (req, res) => {
  const eventKey = req.params.eventKey
  const teamNumber = req.params.teamNumber
  pool
    .connect()
    .then(async client => {
      try {
        const team = await client.query('SELECT * FROM team INNER JOIN event ON team.eventid = event.id WHERE event.blue_alliance_id = $1 AND team.team_number = $2', [eventKey, teamNumber])
        res.status(200).json(team.rows[0])
      } finally {
        client.release()
      }
    })
    .catch(e => {
      res.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.post('/team/:teamNumber/:eventKey', (req, res) => {
  const eventKey = req.params.eventKey
  const teamNumber = req.params.teamNumber
  const data = req.body
  pool
    .connect()
    .then(async client => {
      try {
        const team = await client.query('SELECT * FROM team INNER JOIN event ON team.eventid = event.id WHERE event.blue_alliance_id = $1 AND team.team_number = $2', [eventKey, teamNumber])
        if (team.rowCount === 0) {
          res.status(404).json('error, not found')
        } else if (team.rowCount === 1) {
          const eventId = team.rows[0].eventid
          const newData = team.rows[0].data
          newData.strengths = data.strengths
          newData.flaws = data.flaws
          newData.strategies = data.strategies
          await client.query('UPDATE team SET data=$3 WHERE eventid=$1 AND team_number=$2', [eventId, teamNumber, newData])
          res.status(201).json('action executed')
        } else {
          console.error(`count is ${team.rows[0].count}`)
          res.status(406).json(`error, count is ${team.rows[0].count}`)
        }
      } finally {
        client.release()
      }
    })
    .catch(e => {
      res.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.put('/pullmatches/:eventKey', (req, response) => {
  const eventKey = req.params.eventKey
  pool
    .connect()
    .then(async client => {
      try {
        const [matches, matchesInDb, eventId] = await Promise.all([
          instance.get(`/event/${eventKey}/matches/simple`),
          client.query('SELECT match.* FROM match INNER JOIN event ON match.eventid = event.id WHERE event.blue_alliance_id = $1', [eventKey]),
          client.query('SELECT * FROM event WHERE blue_alliance_id = $1', [eventKey])
        ])

        if (matchesInDb.rowCount === 0) {
          const matchList = convertMatches(matches.data, eventId.rows[0].id)
          for (const i in matchList) {
            await client.query('INSERT INTO match (eventid, blue1, blue2, blue3, red1, red2, red3, match_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', matchList[i])
          }
          response.status(201).json('action executed')
        } else {
          console.error(`error, eventKey ${eventKey} already has matches`)
          response.json(`error, eventKey ${eventKey} already has matches`)
        }
      } finally {
        client.release()
      }
    })
    .catch(e => {
      response.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.put('/pullteams/:eventKey', (req, res) => {
  const eventKey = req.params.eventKey.search(bobbyTable) === 0 ? req.params.eventKey : null
  pool
    .connect()
    .then(async client => {
      try {
        const [teams, teamEventsInDb, teamsInDb, eventId] = await Promise.all([
          instance.get(`/event/${eventKey}/teams/simple`),
          client.query('SELECT team_event.* FROM team_event INNER JOIN event ON team_event.eventid = event.id WHERE event.blue_alliance_id = $1', [eventKey]),
          client.query('SELECT * FROM team'),
          client.query('SELECT * FROM event WHERE blue_alliance_id = $1', [eventKey])
        ])
        const newTeams = convertTeams(teams.data.filter((a) => !teamsInDb.rows.includes((b) => b.id === a.team_number)))

        if (teamEventsInDb.rowCount === 0) {
          const teamList = convertTeamEvents(teams.data, eventId.rows[0].id)
          for (const i in teamList) {
            client.query('INSERT INTO team_event (eventid, team_number) VALUES ($1, $2)', teamList[i])
          }
          if (newTeams.length) {
            for (const i in newTeams) {
              client.query('INSERT INTO team (id, name) VALUES ($1, $2)', newTeams[i])
            }
          }
          res.status(201).json('action executed')
        } else {
          console.error(`error, eventKey ${eventKey} already has teams`)
          res.json(`error, eventKey ${eventKey} already has teams`)
        }
      } finally {
        client.release()
      }
    })
    .catch(e => {
      res.status(500).json('something went wrong')
      console.error(e.stack)
    })
})

app.put('/updateteams/:eventKey', (req, res) => {
  const eventKey = req.params.eventKey
  pool
    .connect()
    .then(async client => {
      try {
        const stats = client.query('SELECT * FROM match INNER JOIN event ON match.eventid = event.id INNER JOIN team_match_stat ON match.id = team_match_stat.matchid WHERE event.blue_alliance_id = $1', [eventKey])
        const teams = client.query('SELECT team.name as team_name, team_event.* FROM team_event INNER JOIN event ON team_event.eventid = event.id INNER JOIN team ON team_event.team_number = team.id WHERE event.blue_alliance_id = $1', [eventKey])
        const matches = instance.get(`/event/${eventKey}/matches/simple`)
        await Promise.all([stats, teams, matches])

        const allTeamData = updateTeams(teams, stats)
        const teamElos = calculateElo(teams, matches.data)
        // const teamOpr
        allTeamData.map((d, i, a) => { d[i].data.elo = teamElos.find(o => d[i].teamNumber === o.teamNumber).score })
        // now I need to figure out how to update everything in the DB
        res.status(201).json('action executed')
      } finally {
        client.release()
      }
    })
    .catch(e => console.error(e.stack))
})
