const convertMatches = (matches, eventId) => {
  const matchList = []
  for (const i in matches) {
    if (matches[i].comp_level === 'qm') {
      matchList.push([
        eventId,
        parseInt(matches[i].alliances.blue.team_keys[0].substring(3)),
        parseInt(matches[i].alliances.blue.team_keys[1].substring(3)),
        parseInt(matches[i].alliances.blue.team_keys[2].substring(3)),
        parseInt(matches[i].alliances.red.team_keys[0].substring(3)),
        parseInt(matches[i].alliances.red.team_keys[1].substring(3)),
        parseInt(matches[i].alliances.red.team_keys[2].substring(3)),
        matches[i].match_number
      ])
    }
  }
  return matchList
}

const convertTeams = (teams) => {
  const teamList = teams.map((a) => [
    parseInt(a.team_number),
    a.nickname.substring(0, 24)
  ])
  return teamList
}

const convertTeamEvents = (teams, eventId) => {
  const teamList = teams.map((a) => [
    eventId,
    parseInt(a.team_number)
  ])
  return teamList
}

const calculateElo = (teams, matchResults) => {
  const BETTER_SCORE = 20
  const SAME_SCORE = 30
  const WORSE_SCORE = 40
  const finalTeamList = []
  for (const i in teams.rows) {
    finalTeamList.push({
      teamNumber: teams.rows[i].team_number,
      score: 0
    })
  }
  for (const i in matchResults) {
    if (matchResults[i].comp_level === 'qm' && matchResults[i].winning_alliance !== null) {
      let blueTeamElo = 0
      let redTeamElo = 0
      let blueEloChange
      let redEloChange
      for (let j = 0; j < 3; j++) {
        blueTeamElo += finalTeamList.find(o => o.teamNumber === parseInt(matchResults[i].alliances.blue.team_keys[j].substring(3))).score
        redTeamElo += finalTeamList.find(o => o.teamNumber === parseInt(matchResults[i].alliances.red.team_keys[j].substring(3))).score
      }
      blueTeamElo /= 3
      redTeamElo /= 3
      if (matchResults[i].winning_alliance === 'blue') {
        if (blueTeamElo + 10 > redTeamElo || blueTeamElo - 10 > redTeamElo) {
          redEloChange = -SAME_SCORE
          blueEloChange = SAME_SCORE
        } else {
          if (blueTeamElo > redTeamElo) {
            redEloChange = -BETTER_SCORE
            blueEloChange = BETTER_SCORE
          } else {
            redEloChange = -WORSE_SCORE
            blueEloChange = WORSE_SCORE
          }
        }
      } else {
        if (redTeamElo + 10 > blueTeamElo || redTeamElo - 10 > blueTeamElo) {
          blueEloChange = -SAME_SCORE
          redEloChange = SAME_SCORE
        } else {
          if (redTeamElo > blueTeamElo) {
            blueEloChange = -BETTER_SCORE
            redEloChange = BETTER_SCORE
          } else {
            blueEloChange = -WORSE_SCORE
            redEloChange = WORSE_SCORE
          }
        }
      }
      for (let j = 0; j < 3; j++) {
        finalTeamList.find(o => o.teamNumber === parseInt(matchResults[i].alliances.blue.team_keys[j].substring(3))).score += blueEloChange
        finalTeamList.find(o => o.teamNumber === parseInt(matchResults[i].alliances.red.team_keys[j].substring(3))).score += redEloChange
      }
    }
  }
  return finalTeamList
}

// const calculateOpr = (teams, matchResults) => {
// TODO: Calculate OPR or query it from someone
// }

const updateTeams = (teams, stats) => {
  const allTeamData = []
  for (const i in teams.rows) {
    const teamNumber = teams.rows[i].team_number

    const lowScored = []
    const outerScored = []
    const innerScored = []
    const totalScored = []
    const totalAttempted = []
    const hanging = []
    const penalties = []

    for (const j in stats.rows) {
      if (stats.rows[j].team_number === teamNumber) {
        lowScored.push({
          data: stats.rows[j].data.lowScored,
          matchNumber: stats.rows[j].match_number
        })
        outerScored.push({
          data: stats.rows[j].data.outerScored,
          matchNumber: stats.rows[j].match_number
        })
        innerScored.push({
          data: stats.rows[j].data.innerScored,
          matchNumber: stats.rows[j].match_number
        })

        totalScored.push({
          data: stats.rows[j].data.totalScored,
          matchNumber: stats.rows[j].match_number
        })
        totalAttempted.push({
          data: stats.rows[j].data.totalAttempted,
          matchNumber: stats.rows[j].match_number
        })

        hanging.push({
          data: stats.rows[j].data.hanging,
          matchNumber: stats.rows[j].match_number
        })
        penalties.push({
          data: stats.rows[j].data.amountOfPenalties,
          matchNumber: stats.rows[j].match_number
        })
      }
    }

    const avgLow = findAverage(lowScored)
    const avgOuter = findAverage(outerScored)
    const avgInner = findAverage(innerScored)
    const avgTotal = findAverage(totalScored)
    const avgAttempted = findAverage(totalAttempted)
    const avgHang = findAverage(hanging) * 100
    const avgPen = findAverage(penalties)

    allTeamData.push({
      teamNumber: teamNumber,
      data: {
        avgLow: avgLow,
        avgOuter: avgOuter,
        avgInner: avgInner,
        avgTotal: avgTotal,
        avgAttempted: avgAttempted,

        lowScored: lowScored,
        outerScored: outerScored,
        innerScored: innerScored,
        totalScored: totalScored,
        totalAttempted: totalAttempted,

        avgHang: avgHang,
        avgPen: avgPen,

        hanging: hanging,
        penalties: penalties
      }
    })
  }
  return allTeamData
}

const findAverage = (arr) => {
  return (arr.length !== 0) ? arr.reduce((a, b) => a + b.data, 0) / arr.length : 0
}

module.exports = { convertMatches, convertTeams, convertTeamEvents, updateTeams, findAverage, calculateElo }
