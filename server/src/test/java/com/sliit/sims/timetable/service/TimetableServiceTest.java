package com.sliit.sims.timetable.service;

import com.sliit.sims.common.exception.ScheduleConflictException;
import com.sliit.sims.timetable.dto.TimetableEntryRequest;
import com.sliit.sims.timetable.dto.TimetableEntryResponse;
import com.sliit.sims.timetable.model.*;
import com.sliit.sims.timetable.repository.TimeSlotRepository;
import com.sliit.sims.timetable.repository.TimetableEntryRepository;
import com.sliit.sims.timetable.repository.TimetableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimetableServiceTest {

    @Mock
    private TimetableRepository timetableRepository;

    @Mock
    private TimetableEntryRepository entryRepository;

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @InjectMocks
    private TimetableService timetableService;

    private Timetable mockTimetable;
    private TimeSlot mockSlot;

    @BeforeEach
    void setUp() {
        mockTimetable = Timetable.builder()
                .id(1L)
                .classId(10L)
                .academicYear(2026)
                .term(1)
                .status(TimetableStatus.DRAFT)
                .build();

        mockSlot = TimeSlot.builder()
                .id(100L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .periodNumber(1)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(8, 45))
                .build();
    }

    @Test
    void shouldAddEntryWhenNoConflictExists() {
        TimetableEntryRequest req = new TimetableEntryRequest(100L, 5L, 20L, "LAB-1");

        when(timetableRepository.findById(1L)).thenReturn(Optional.of(mockTimetable));
        when(timeSlotRepository.findById(100L)).thenReturn(Optional.of(mockSlot));
        when(entryRepository.findClassSlotConflict(1L, 100L)).thenReturn(Optional.empty());
        when(entryRepository.findTeacherConflict(100L, 20L)).thenReturn(Optional.empty());
        when(entryRepository.findRoomConflict(100L, "LAB-1")).thenReturn(Optional.empty());

        TimetableEntry savedEntry = TimetableEntry.builder()
                .id(500L)
                .timetable(mockTimetable)
                .timeSlot(mockSlot)
                .subjectId(5L)
                .teacherId(20L)
                .roomNumber("LAB-1")
                .build();

        when(entryRepository.save(any(TimetableEntry.class))).thenReturn(savedEntry);

        TimetableEntryResponse res = timetableService.addEntry(1L, req);

        assertNotNull(res);
        assertEquals(500L, res.id());
        assertEquals("LAB-1", res.roomNumber());
        assertEquals("MONDAY", res.dayOfWeek());
    }

    @Test
    void shouldThrowTeacherBusyConflict() {
        TimetableEntryRequest req = new TimetableEntryRequest(100L, 5L, 20L, "LAB-1");

        when(timetableRepository.findById(1L)).thenReturn(Optional.of(mockTimetable));
        when(timeSlotRepository.findById(100L)).thenReturn(Optional.of(mockSlot));
        when(entryRepository.findClassSlotConflict(1L, 100L)).thenReturn(Optional.empty());

        TimetableEntry existingEntry = TimetableEntry.builder()
                .id(99L)
                .timeSlot(mockSlot)
                .teacherId(20L)
                .roomNumber("ROOM-A")
                .build();

        when(entryRepository.findTeacherConflict(100L, 20L)).thenReturn(Optional.of(existingEntry));

        ScheduleConflictException ex = assertThrows(
                ScheduleConflictException.class,
                () -> timetableService.addEntry(1L, req)
        );

        assertEquals(ScheduleConflictException.ConflictType.TEACHER_BUSY, ex.getConflictType());
        verify(entryRepository, never()).save(any());
    }

    @Test
    void shouldThrowRoomOccupiedConflict() {
        TimetableEntryRequest req = new TimetableEntryRequest(100L, 5L, 20L, "LAB-1");

        when(timetableRepository.findById(1L)).thenReturn(Optional.of(mockTimetable));
        when(timeSlotRepository.findById(100L)).thenReturn(Optional.of(mockSlot));
        when(entryRepository.findClassSlotConflict(1L, 100L)).thenReturn(Optional.empty());
        when(entryRepository.findTeacherConflict(100L, 20L)).thenReturn(Optional.empty());

        TimetableEntry existingEntry = TimetableEntry.builder()
                .id(98L)
                .timeSlot(mockSlot)
                .teacherId(999L)
                .roomNumber("LAB-1")
                .build();

        when(entryRepository.findRoomConflict(100L, "LAB-1")).thenReturn(Optional.of(existingEntry));

        ScheduleConflictException ex = assertThrows(
                ScheduleConflictException.class,
                () -> timetableService.addEntry(1L, req)
        );

        assertEquals(ScheduleConflictException.ConflictType.ROOM_OCCUPIED, ex.getConflictType());
        verify(entryRepository, never()).save(any());
    }

    @Test
    void shouldThrowClassSlotConflictWhenDuplicatePeriod() {
        TimetableEntryRequest req = new TimetableEntryRequest(100L, 5L, 20L, "LAB-1");

        when(timetableRepository.findById(1L)).thenReturn(Optional.of(mockTimetable));
        when(timeSlotRepository.findById(100L)).thenReturn(Optional.of(mockSlot));

        TimetableEntry existingEntry = TimetableEntry.builder()
                .id(97L)
                .timeSlot(mockSlot)
                .build();

        when(entryRepository.findClassSlotConflict(1L, 100L)).thenReturn(Optional.of(existingEntry));

        ScheduleConflictException ex = assertThrows(
                ScheduleConflictException.class,
                () -> timetableService.addEntry(1L, req)
        );

        assertEquals(ScheduleConflictException.ConflictType.CLASS_SLOT_TAKEN, ex.getConflictType());
        verify(entryRepository, never()).save(any());
    }

    @Test
    void shouldRejectPublishingEmptyTimetable() {
        when(timetableRepository.findById(1L)).thenReturn(Optional.of(mockTimetable));

        assertThrows(IllegalStateException.class, () -> timetableService.publishTimetable(1L));
    }
}

