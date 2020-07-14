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
      teams[i].nickname.substring(0,24)
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
        lowScored.push(stats.rows[j].data.lowScored)
        outerScored.push(stats.rows[j].data.outerScored)
        innerScored.push({
          "data":stats.rows[j].data.innerScored,
          "matchNumber":stats.rows[j].match_number
        })

        totalScored.push(stats.rows[j].data.totalScored)
        totalAttempted.push(stats.rows[j].data.totalAttempted)

        hanging.push(stats.rows[j].data.hanging)
        penalties.push(stats.rows[j].data.amountOfPenalties)
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
      "avgLow":avgLow,
      "avgOuter":avgOuter,
      "avgInner":avgInner,
      "avgTotal":avgTotal,
      "avgAttempted":avgAttempted,

      "lowScored":lowScored,
      "outerScored":outerScored,
      "innerScored":innerScored,
      "totalScored":totalScored,
      "totalAttempted":totalAttempted,

      "avgHang":avgHang,
      "avgPen":avgPen,

      "hanging":hanging,
      "penalties":penalties,
    })
  }
  return allTeamData
}

function findAverage(arr) {
  return arr.length !== 0 ? (arr.reduce((a, b) => a.data + b.data) / arr.length) : null
}

module.exports = { convertMatches, convertTeams, updateTeams }