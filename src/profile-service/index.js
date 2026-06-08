function pillarToString(pillar) {
  return pillar.stem + pillar.branch;
}

function prepareUserRecord(input) {
  return {
    birth_date: input.birthDate,
    birth_hour: input.birthHour,
    birth_calendar_type: input.calendarType,
    created_at: new Date().toISOString(),
  };
}

function prepareBaziProfileRecord(input, computedProfile) {
  return {
    year_pillar: pillarToString(computedProfile.yearPillar),
    month_pillar: pillarToString(computedProfile.monthPillar),
    day_pillar: pillarToString(computedProfile.dayPillar),
    hour_pillar: pillarToString(computedProfile.hourPillar),
    day_master: computedProfile.dayMaster,
    five_elements_distribution: computedProfile.fiveElementsDistribution,
    is_hour_estimated: computedProfile.isHourEstimated,
    calculated_at: new Date().toISOString(),
  };
}

module.exports = { prepareUserRecord, prepareBaziProfileRecord };