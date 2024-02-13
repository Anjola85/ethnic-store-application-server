export interface ScheduleRespDto {
  sunday: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
}

export interface DaySchedule {
  open: Timing;
  close: Timing;
}

export interface Timing {
  hour: number;
  minute: number;
}
