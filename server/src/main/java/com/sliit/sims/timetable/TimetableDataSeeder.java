package com.sliit.sims.timetable;

import com.sliit.sims.timetable.model.*;
import com.sliit.sims.timetable.repository.TimeSlotRepository;
import com.sliit.sims.timetable.repository.TimetableEntryRepository;
import com.sliit.sims.timetable.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TimetableDataSeeder implements CommandLineRunner {

    private final TimeSlotRepository timeSlotRepository;
    private final TimetableRepository timetableRepository;
    private final TimetableEntryRepository entryRepository;

    @Override
    public void run(String... args) {
        if (timeSlotRepository.count() > 0) {
            return;
        }

        LocalTime[][] periodTimes = {
                {LocalTime.of(8, 0), LocalTime.of(8, 45)},
                {LocalTime.of(8, 45), LocalTime.of(9, 30)},
                {LocalTime.of(9, 30), LocalTime.of(10, 15)},
                {LocalTime.of(10, 30), LocalTime.of(11, 15)},
                {LocalTime.of(11, 15), LocalTime.of(12, 0)},
                {LocalTime.of(12, 0), LocalTime.of(12, 45)},
                {LocalTime.of(13, 15), LocalTime.of(14, 0)},
                {LocalTime.of(14, 0), LocalTime.of(14, 45)}
        };

        List<TimeSlot> slots = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            for (int p = 0; p < periodTimes.length; p++) {
                slots.add(TimeSlot.builder()
                        .dayOfWeek(day)
                        .periodNumber(p + 1)
                        .startTime(periodTimes[p][0])
                        .endTime(periodTimes[p][1])
                        .build());
            }
        }
        timeSlotRepository.saveAll(slots);
    }
}

