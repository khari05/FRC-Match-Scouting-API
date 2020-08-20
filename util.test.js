/* global test, expect */
const { convertMatches, findAverage, convertTeams } = require('./util')

test('should output red team number and blue team number in the right order', () => {
  const testMatchList = [{
    alliances: {
      blue: { team_keys: ['frc1', 'frc2', 'frc3'] },
      red: { team_keys: ['frc4', 'frc5', 'frc6'] }
    },
    comp_level: 'qm',
    match_number: 8
  }, {
    alliances: {
      blue: { team_keys: ['frc6', 'frc5', 'frc4'] },
      red: { team_keys: ['frc3', 'frc2', 'frc1'] }
    },
    comp_level: 'qm',
    match_number: 9
  }, {
    alliances: {
      blue: { team_keys: ['frc6', 'frc5', 'frc4'] },
      red: { team_keys: ['frc3', 'frc2', 'frc1'] }
    },
    comp_level: 'f',
    match_number: 1
  }, {
    alliances: {
      blue: { team_keys: ['frc6', 'frc5', 'frc4'] },
      red: { team_keys: ['frc3', 'frc2', 'frc1'] }
    },
    comp_level: 'sf',
    match_number: 1
  }, {
    alliances: {
      blue: { team_keys: ['frc6', 'frc5', 'frc4'] },
      red: { team_keys: ['frc3', 'frc2', 'frc1'] }
    },
    comp_level: 'qf',
    match_number: 1
  }]

  const matchList = convertMatches(testMatchList, 10)

  expect(matchList).toStrictEqual([
    [10, 1, 2, 3, 4, 5, 6, 8],
    [10, 6, 5, 4, 3, 2, 1, 9]])
})

test('should convert team json to list', () => {
  const testJson = [
    { team_number: 1111, nickname: 'this long name is going to be cut off by the substring' },
    { team_number: 9999, nickname: 'this is a short name' }
  ]
  const teamList = convertTeams(testJson, 'thisisanevent')
  expect(teamList).toStrictEqual([
    ['thisisanevent', 1111, 'this long name is going '],
    ['thisisanevent', 9999, 'this is a short name']
  ])
})

test('should output the correct average', () => {
  const testArr = [{ data: 1 }, { data: 2 }, { data: 3 }, { data: 4 }, { data: 5 }, { data: 6 }, { data: 7 }, { data: 8 }, { data: 9 }]

  const average = findAverage(testArr)

  expect(average).toStrictEqual(5)
})
