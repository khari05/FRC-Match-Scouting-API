exports.convertMatches = (matches, eventId) => {
    let matchList = []
    for (i in matches) {
      if (matches[i].comp_level === "qm") {
        matchList.push({
          "eventid":eventId,
          "blue1":parseInt(matches[i].alliances.blue.team_keys[0].substring(3)),
          "blue2":parseInt(matches[i].alliances.blue.team_keys[1].substring(3)),
          "blue3":parseInt(matches[i].alliances.blue.team_keys[2].substring(3)),
          "red1":parseInt(matches[i].alliances.red.team_keys[0].substring(3)),
          "red2":parseInt(matches[i].alliances.red.team_keys[1].substring(3)),
          "red3":parseInt(matches[i].alliances.red.team_keys[2].substring(3)),
          "match_number":matches[i].match_number
        })
      }
    }
    return matchList
}