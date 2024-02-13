export interface Timing {
  hour: number;
  minute: number;
}
export interface DaySchedule {
  open: Timing;
  close: Timing;
}

export interface ScheduleRespDto {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}
