function convertMatches (matches, eventId) {
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

function convertTeams (teams, eventId) {
  const teamList = []
  for (const i in teams) {
    teamList.push([
      eventId,
      parseInt(teams[i].team_number),
      teams[i].nickname.substring(0, 24)
    ])
  }
  return teamList
}

function updateTeams (teams, stats) {
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
    const avgHang = findAverage(hanging)
    const avgPen = findAverage(penalties)

    allTeamData.push({
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
    })
  }
  return allTeamData
}

function findAverage (arr) {
  return (arr.length !== 0) ? arr.reduce((a, b) => a + b.data, 0) / arr.length : 0
}

module.exports = { convertMatches, convertTeams, updateTeams, findAverage }
