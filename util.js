function convertMatches(matches, eventId) {
  let matchList = []
  for (i in matches) {
    if (matches[i].comp_level === "qm") {
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

function convertTeams(teams, eventId) {
  let teamList = []
  for (i in teams) {
    teamList.push([
      eventId,
      parseInt(teams[i].team_number),
      teams[i].nickname.substring(0, 24)
    ])
  }
  return teamList
}

function updateTeams(teams, stats) {
  let allTeamData = [];
  for (i in teams.rows) {
    const teamNumber = teams.rows[i].team_number

    let lowScored = []
    let outerScored = []
    let innerScored = []
    let totalScored = []
    let totalAttempted = []
    let hanging = []
    let penalties = []

    for (j in stats.rows) {
      if (stats.rows[j].team_number === teamNumber) {
        lowScored.push({
          "data":stats.rows[j].data.lowScored,
          "matchNumber": stats.rows[j].match_number
        })
        outerScored.push({
          "data": stats.rows[j].data.outerScored,
          "matchNumber": stats.rows[j].match_number
        })
        innerScored.push({
          "data": stats.rows[j].data.innerScored,
          "matchNumber": stats.rows[j].match_number
        })

        totalScored.push({
          "data": stats.rows[j].data.totalScored,
          "matchNumber": stats.rows[j].match_number
        })
        totalAttempted.push({
          "data": stats.rows[j].data.totalAttempted,
          "matchNumber": stats.rows[j].match_number
        })

        hanging.push({
          "data": stats.rows[j].data.hanging,
          "matchNumber": stats.rows[j].match_number
        })
        penalties.push({
          "data": stats.rows[j].data.amountOfPenalties,
          "matchNumber": stats.rows[j].match_number
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
      "avgLow": avgLow,
      "avgOuter": avgOuter,
      "avgInner": avgInner,
      "avgTotal": avgTotal,
      "avgAttempted": avgAttempted,

      "lowScored": lowScored,
      "outerScored": outerScored,
      "innerScored": innerScored,
      "totalScored": totalScored,
      "totalAttempted": totalAttempted,

      "avgHang": avgHang,
      "avgPen": avgPen,

      "hanging": hanging,
      "penalties": penalties,
    })
  }
  return allTeamData
}

function findAverage(arr) {
  return (arr.length !== 0) ? arr.reduce((a, b) => a + b.data, 0) : 0
}

module.exports = { convertMatches, convertTeams, updateTeams }