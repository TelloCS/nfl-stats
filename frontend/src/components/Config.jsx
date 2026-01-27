export const PositionStatMap = {
    'QB': [
        { key: 'completions', label: 'Cmp' },
        { key: 'pass_attempts', label: 'Pass Att' },
        { key: 'pass_yards', label: 'Pass Yds' },
        { key: 'yards_per_pass_attempt', label: 'YPA' },
        { key: 'long_passing', label: 'Long Pass' },
        { key: 'completion_pct', label: 'Cmp %' },
        { key: 'pass_touchdowns', label: 'Pass TD' },
        { key: 'pass_rating', label: 'Pass Rate' },
        { key: 'adjusted_qbr', label: 'QBR' },
        { key: 'sacks', label: 'Sck' },
        { key: 'rush_attempts', label: 'Rush Att' },
        { key: 'rush_yards', label: 'Rush Yds' },
        { key: 'rush_touchdowns', label: 'Rush TD' },
        { key: 'yards_per_rush_attempt', label: 'YPC' },
        { key: 'long_rushing', label: 'Long Rush' },
    ],
    'RB': [
        { key: 'rush_attempts', label: 'Rush Att' },
        { key: 'rush_yards', label: 'Rush Yds' },
        { key: 'yards_per_rush_attempt', label: 'YPC' },
        { key: 'long_rushing', label: 'Long Rush' },
        { key: 'rush_touchdowns', label: 'Rush TD' },


        { key: 'receptions', label: 'Receptions' },
        { key: 'rec_targets', label: 'Targets' },
        { key: 'rec_yards', label: 'Receiving Yards' },
        { key: 'yards_per_reception', label: 'YPR' },
        { key: 'long_reception', label: 'Long Rec' },
        { key: 'rec_touchdowns', label: 'Rec TD' },
    ],
    'WR': [
        { key: 'receptions', label: 'Receptions' },
        { key: 'rec_targets', label: 'Targets' },
        { key: 'rec_yards', label: 'Rec Yds' },
        { key: 'yards_per_reception', label: 'Yds/Rec' },
        { key: 'long_reception', label: 'Long Rec' },
        { key: 'rec_touchdowns', label: 'Rec TD' },

        { key: 'rush_attempts', label: 'Rush Att' },
        { key: 'rush_yards', label: 'Rush Yds' },
        { key: 'yards_per_rush_attempt', label: 'YPC' },
        { key: 'long_rushing', label: 'Long Rush' },
        { key: 'rush_touchdowns', label: 'Rush TD' },
    ],
    'TE': [
        { key: 'receptions', label: 'Receptions' },
        { key: 'rec_targets', label: 'Targets' },
        { key: 'rec_yards', label: 'Rec Yds' },
        { key: 'yards_per_reception', label: 'YPR' },
        { key: 'long_reception', label: 'Long Rec' },
        { key: 'rec_touchdowns', label: 'Rec TD' },

        { key: 'rush_attempts', label: 'Rush Att' },
        { key: 'rush_yards', label: 'Rush Yds' },
        { key: 'yards_per_rush_attempt', label: 'YPC' },
        { key: 'long_rushing', label: 'Long Rush' },
        { key: 'rush_touchdowns', label: 'Rush TD' },
    ],
    'DEFAULT': []
};

export const NFL_POSITIONS = [
    { value: 'QB' }, { value: 'RB' }, { value: 'WR' }, { value: 'TE' },
];

export const NFL_TEAMS = [
    { value: 'ARI' },
    { value: 'ATL' },
    { value: 'BAL' },
    { value: 'BUF' },
    { value: 'CAR' },
    { value: 'CHI' },
    { value: 'CIN' },
    { value: 'CLE' },
    { value: 'DAL' },
    { value: 'DEN' },
    { value: 'DET' },
    { value: 'GB' },
    { value: 'HOU' },
    { value: 'IND' },
    { value: 'JAX' },
    { value: 'KC' },
    { value: 'LAC' },
    { value: 'LAR' },
    { value: 'LV' },
    { value: 'MIA' },
    { value: 'MIN' },
    { value: 'NE' },
    { value: 'NO' },
    { value: 'NYG' },
    { value: 'NYJ' },
    { value: 'PHI' },
    { value: 'PIT' },
    { value: 'SEA' },
    { value: 'SF' },
    { value: 'TB' },
    { value: 'TEN' },
    { value: 'WSH' },
]

export const NFLTeamStatMap = [
    {
        key: 'team_offense_passing',
        label: 'Off. Passing',
        stats: [
            { key: 'pass_attempts', label: 'Att' },
            { key: 'completions', label: 'Cmp' },
            { key: 'completion_pct', label: 'Cmp %' },
            { key: 'yards_per_attempt', label: 'Yds/Att' },
            { key: 'pass_yards', label: 'Pass Yds' },
            { key: 'pass_touchdowns', label: 'TD' },
            { key: 'interceptions', label: 'Int' },
            { key: 'pass_rating', label: 'Rate' },
            { key: 'sacks', label: 'Sck' },
            { key: 'sack_yards', label: 'SckY' },
        ]
    },
    {
        key: 'team_offense_rushing',
        label: 'Off. Rushing',
        stats: [
            { key: 'rush_attempts', label: 'Att' },
            { key: 'rush_yards', label: 'Rush Yds' },
            { key: 'yards_per_carry', label: 'YPC' },
            { key: 'rush_touchdowns', label: 'TD' },
            { key: 'rush_fumbles', label: 'Rush Fum' },
        ]
    },
    {
        key: 'team_offense_receiving',
        label: 'Off. Receiving',
        stats: [
            { key: 'receptions', label: 'Rec'},
            { key: 'rec_yards', label: 'Yds' },
            { key: 'yards_per_reception', label: 'Yds/Rec' },
            { key: 'rec_touchdowns', label: 'TD' },
            { key: 'rec_fumbles', label: 'Rec Fum' },
        ]
    },
    {
        key: 'team_defense_passing',
        label: 'Def. Passing',
        stats: [
            { key: 'pass_attempts', label: 'Att' },
            { key: 'completions', label: 'Cmp' },
            { key: 'completion_pct', label: 'Cmp %' },
            { key: 'yards_per_attempt', label: 'Yds/Att' },
            { key: 'pass_yards', label: 'Pass Yds' },
            { key: 'pass_touchdowns', label: 'TD' },
            { key: 'interceptions', label: 'Int' },
            { key: 'pass_rating', label: 'Rate' },
            { key: 'sacks', label: 'Sck' },
        ]
    },
    {
        key: 'team_defense_rushing',
        label: 'Def. Rushing',
        stats: [
            { key: 'rush_attempts', label: 'Att' },
            { key: 'rush_yards', label: 'Yds' },
            { key: 'yards_per_carry', label: 'YPC' },
            { key: 'rush_touchdowns', label: 'TD' },
            { key: 'rush_fumbles', label: 'Rush Fum' },
        ]
    },
    {
        key: 'team_defense_receiving',
        label: 'Def. Receiving',
        stats: [
            { key: 'receptions', label: 'Rec'},
            { key: 'rec_yards', label: 'Yds' },
            { key: 'yards_per_reception', label: 'Yds/Rec' },
            { key: 'rec_touchdowns', label: 'TD' },
            { key: 'rec_fumbles', label: 'Rec Fum' },
            { key: 'pass_defended', label: 'PDef'}
        ]
    },
    {
        key: 'team_advance_offense',
        label: 'Adv. Off.',
        stats: [
            { key: 'expected_points_added_per_play', label: 'EPA/Play'},
            { key: 'total_expected_points_added', label: 'Total EPA' },
            { key: 'success_pct', label: 'Success %' },
            { key: 'expected_points_added_per_pass', label: 'EPA/Pass' },
            { key: 'expected_points_added_per_rush', label: 'EPA/Rush' },
            { key: 'average_depth_of_target', label: 'ADoT'},
            { key: 'scramble_pct', label: 'Scramble %'},
            { key: 'interception_pct', label: 'Int %'},
        ]
    },
    {
        key: 'team_advance_defense',
        label: 'Adv. Def.',
        stats: [
            { key: 'expected_points_added_per_play', label: 'EPA/Play'},
            { key: 'total_expected_points_added', label: 'Total EPA' },
            { key: 'success_pct', label: 'Success %' },
            { key: 'expected_points_added_allowed_per_pass', label: 'EPA/Pass' },
            { key: 'expected_points_added_allowed_per_rush', label: 'EPA/Rush' },
            { key: 'average_depth_of_target_against', label: 'ADoT'},
            { key: 'scramble_pct', label: 'Scramble %'},
            { key: 'interception_pct', label: 'Int %'},
        ]
    },
    {
        key: 'team_coverage_rates',
        label: 'Coverage Rates',
        stats: [
            { key: 'man_rate', label: 'Man Rate'},
            { key: 'zone_rate', label: 'Zone Rate' },
            { key: 'middle_closed_rate', label: 'Middle Closed Rate' },
            { key: 'middle_open_rate', label: 'Middle Open Rate' },
        ]
    },
    {
        key: 'team_play_calling',
        label: 'Play Calling',
        stats: [
            { key: 'motion_rate', label: 'Motion Rate'},
            { key: 'play_action_rate', label: 'Play Action Rate' },
            { key: 'airyards_per_att', label: 'Air Yards/Attempt' },
            { key: 'shotgun_rate', label: 'Shotgun Rate' },
            { key: 'nohuddle_rate', label: 'No Huddle Rate' },
        ]
    },
    {
        key: 'team_coverage_stats_by_position',
        label: 'Coverage Stats By Position',
        stats: [
            { key: 'yards_allowed_wr', label: 'Yards Allowed WR'},
            { key: 'yards_allowed_te', label: 'Yards Allowed TE' },
            { key: 'yards_allowed_rb', label: 'Yards Allowed RB' },
            { key: 'yards_allowed_outside', label: 'Yards Allowed Outside' },
            { key: 'yards_allowed_slot', label: 'Yards Allowed Slot' },
        ]
    },
]

export const RankingTabsV2 = [
    {
        key: 'team_offense_passing',
        label: 'Off. Passing',
        stats: [
            { key: 'off_pass_yards_rank', label: 'Yds'},
            { key: 'off_pass_tds_rank', label: 'TD'},
            { key: 'off_pass_rating_rank', label: 'Rate'}
        ]
    },
    {
        key: 'team_offense_rushing',
        label: 'Off. Rushing',
        stats: [
            { key: 'off_rush_yards_rank', label: 'Yds'},
            { key: 'off_rush_tds_rank', label: 'TD'},
            { key: 'off_rush_attempts_rank', label: 'Att'},
        ]
    },
    {
        key: 'team_offense_receiving',
        label: 'Off. Receiving',
        stats: [
            { key: 'off_receptions_rank', label: 'Rec'},
            { key: 'off_rec_yards_rank', label: 'Yds'},
            { key: 'off_rec_tds_rank', label: 'TD'},
        ]
    },
    {
        key: 'team_defense_passing',
        label: 'Def. Passing',
        stats: [
            { key: 'def_pass_yards_rank', label: 'Yds'},
            { key: 'def_pass_tds_rank', label: 'TD'},
            { key: 'def_pass_rating_rank', label: 'Rate'}
        ]
    },
    {
        key: 'team_defense_rushing',
        label: 'Def. Rushing',
        stats: [
            { key: 'def_rush_yards_rank', label: 'Yds'},
            { key: 'def_rush_tds_rank', label: 'TD'},
            { key: 'def_rush_attempts_rank', label: 'Att'},
        ]
    },
    {
        key: 'team_defense_receiving',
        label: 'Def. Receiving',
        stats: [
            { key: 'def_receptions_rank', label: 'Rec'},
            { key: 'def_rec_yards_rank', label: 'Yds'},
            { key: 'def_rec_tds_rank', label: 'TD'},
            { key: 'def_pass_defended_rank', label: 'PDef'},
        ]
    },
    {
        key: 'team_advance_offense',
        label: 'Adv. Off.',
        stats: [
            { key: 'off_expected_points_added_per_play_rank', label: 'EPA/Play'},
            { key: 'off_expected_points_added_per_pass_rank', label: 'EPA/Pass'},
            { key: 'off_expected_points_added_per_rush_rank', label: 'EPA/Rush'},
        ]
    },
    {
        key: 'team_advance_defense',
        label: 'Adv. Def.',
        stats: [
            { key: 'def_expected_points_added_per_play_rank', label: 'EPA/Play'},
            { key: 'def_expected_points_added_allowed_per_pass_rank', label: 'EPA/Pass'},
            { key: 'def_expected_points_added_allowed_per_rush_rank', label: 'EPA/Rush'},
        ]
    },
    {
        key: 'team_coverage_rates',
        label: 'Coverage Rates',
        stats: [
            { key: 'man_rate_rank', label: 'Man'},
            { key: 'zone_rate_rank', label: 'Zone'},
            { key: 'middle_closed_rate_rank', label: 'Middle Closed'},
            { key: 'middle_open_rate_rank', label: 'Middle Open'},
        ]
    },
    {
        key: 'team_play_calling',
        label: 'Play Calling',
        stats: [
            { key: 'motion_rate_rank', label: 'Motion'},
            { key: 'play_action_rate_rank', label: 'Play Action'},
            { key: 'shotgun_rate_rank', label: 'Shotgun'},
            { key: 'nohuddle_rate_rank', label: 'No Huddle'},
        ]
    },
    {
        key: 'team_coverage_stats_by_position',
        label: 'Coverage Stats By Position',
        stats: [
            { key: 'yards_allowed_wr_rank', label: 'Yds Allowed WR'},
            { key: 'yards_allowed_te_rank', label: 'Yds Allowed TE'},
            { key: 'yards_allowed_rb_rank', label: 'Yds Allowed RB'},
            { key: 'yards_allowed_outside_rank', label: 'Yds Allowed Outside'},
            { key: 'yards_allowed_slot_rank', label: 'Yds Allowed Slot'},
        ]
    },
]