exports.convertMatches = (matches, eventId) => {
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