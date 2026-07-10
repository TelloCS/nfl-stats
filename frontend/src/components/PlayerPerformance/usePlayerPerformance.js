import { useState, useMemo, useCallback } from "react";
import { PositionStatMap, FilterConfig } from "../Config";
import {
    EMPTY_STATS,
    getSeasonOptions,
    getAvailableStats,
    getCurrentStatDetails
} from "./PlayerPerformance.helpers";
import { SCORING_FORMATS } from "../FantasyRankings/FantasyRankings.helpers";

export function usePlayerPerformance(data, filters, onFilterChange) {
    const [activeStat, setActiveStat] = useState("");
    const [viewMode, setViewMode] = useState("table");
    const [activeTab, setActiveTab] = useState("gamelogs");
    const [currentFormat, setCurrentFormat] = useState(SCORING_FORMATS.ppr_points);

    const defaultSeasonType = FilterConfig.season_type[0].value;
    const [matchupSeasonType, setMatchupSeasonType] = useState(defaultSeasonType);
    const [careerSeasonType, setCareerSeasonType] = useState(defaultSeasonType);

    const currentSeason = filters?.season_year || data?.active_season || "N/A";
    const currentSeasonType = filters?.season_type || defaultSeasonType;
    const seasonTypeOptions = FilterConfig.season_type;
    const chartData = data?.stats || EMPTY_STATS;

    const seasonOptions = useMemo(() =>
        getSeasonOptions(data?.available_seasons),
        [data?.available_seasons]);

    const availableStats = useMemo(() =>
        getAvailableStats(data?.position, PositionStatMap),
        [data?.position]);

    const { currentStatKey, activeStatLabel } = useMemo(() =>
        getCurrentStatDetails(availableStats, activeStat),
        [availableStats, activeStat]);

    const handleSeasonChange = useCallback((v) => onFilterChange('season_year', v), [onFilterChange]);
    const handleSeasonTypeChange = useCallback((t) => onFilterChange('season_type', t), [onFilterChange]);
    const handleFormatChange = useCallback((v) => setCurrentFormat(SCORING_FORMATS[v] || SCORING_FORMATS.ppr_points), []);

    return {
        state: {
            activeStat, viewMode, activeTab, currentFormat,
            matchupSeasonType, careerSeasonType, currentSeason, currentSeasonType
        },
        options: {
            seasonOptions, seasonTypeOptions, availableStats
        },
        computed: {
            chartData, currentStatKey, activeStatLabel
        },
        actions: {
            setActiveStat, setViewMode, setActiveTab,
            setMatchupSeasonType, setCareerSeasonType,
            handleSeasonChange, handleSeasonTypeChange, handleFormatChange
        }
    };
}