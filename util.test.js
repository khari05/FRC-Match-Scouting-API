const { convertMatches } = require("./util")

test("should output red team number and blue team number in the right order", () => {
    const testMatchList = [{
        "alliances": {
            "blue": {"team_keys": ["frc1","frc2","frc3"]},
            "red": {"team_keys": ["frc4","frc5","frc6"]}
        },
        "comp_level": "qm",
        "match_number": 8,
    },{"alliances": {
            "blue": {"team_keys": ["frc6","frc5","frc4"]},
            "red": {"team_keys": ["frc3","frc2","frc1"]}
        },
        "comp_level": "qm",
        "match_number": 9,
    },{"alliances": {
            "blue": {"team_keys": ["frc6","frc5","frc4"]},
            "red": {"team_keys": ["frc3","frc2","frc1"]}
        },
        "comp_level": "f",
        "match_number": 1,
    },{"alliances": {
            "blue": {"team_keys": ["frc6","frc5","frc4"]},
            "red": {"team_keys": ["frc3","frc2","frc1"]}
        },
        "comp_level": "sf",
        "match_number": 1,
    },{"alliances": {
            "blue": {"team_keys": ["frc6","frc5","frc4"]},
            "red": {"team_keys": ["frc3","frc2","frc1"]}
        },
        "comp_level": "qf",
        "match_number": 1,
    }]

    const matchList = convertMatches(testMatchList, 10)

    expect(matchList).toStrictEqual([{
            "eventid":10,
            "blue1":1,
            "blue2":2,
            "blue3":3,
            "red1":4,
            "red2":5,
            "red3":6,
            "match_number":8,
        },
        {
            "eventid":10,
            "blue1":6,
            "blue2":5,
            "blue3":4,
            "red1":3,
            "red2":2,
            "red3":1,
            "match_number":9,
        }])
})