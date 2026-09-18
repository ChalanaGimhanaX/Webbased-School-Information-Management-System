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

    @Mock
    private com.sliit.sims.student.repository.StudentRepository studentRepository;

    @Mock
    private com.sliit.sims.student.repository.StudentClassAllocationRepository allocationRepository;

    @Mock
    private com.sliit.sims.student.repository.AcademicClassRepository classRepository;

    @Mock
    private com.sliit.sims.teacher.repository.SubjectRepository subjectRepository;

    @Mock
    private com.sliit.sims.teacher.repository.TeacherRepository teacherRepository;

    @Mock
    private com.sliit.sims.common.auth.repository.UserRepository userRepository;

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

    @Test
    void shouldUpdateEntryWithoutConflictingWithItself() {
        TimetableEntry entry = TimetableEntry.builder().id(500L).timetable(mockTimetable)
                .timeSlot(mockSlot).subjectId(5L).teacherId(20L).roomNumber("LAB-1").build();
        when(entryRepository.findById(500L)).thenReturn(Optional.of(entry));
        when(timeSlotRepository.findById(100L)).thenReturn(Optional.of(mockSlot));
        when(entryRepository.save(any(TimetableEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TimetableEntryResponse result = timetableService.updateEntry(1L, 500L,
                new TimetableEntryRequest(100L, 6L, 20L, " lab-1 "));

        assertEquals(6L, result.subjectId());
        assertEquals("LAB-1", result.roomNumber());
        verify(entryRepository).findClassSlotConflictExcludingEntry(1L, 100L, 500L);
        verify(entryRepository).findTeacherConflictExcludingEntry(100L, 20L, 500L);
        verify(entryRepository).findRoomConflictExcludingEntry(100L, "lab-1", 500L);
    }

    @Test
    void shouldRejectEditingEntryFromAnotherTimetable() {
        TimetableEntry entry = TimetableEntry.builder().id(500L).timetable(mockTimetable).build();
        when(entryRepository.findById(500L)).thenReturn(Optional.of(entry));

        assertThrows(IllegalArgumentException.class, () -> timetableService.updateEntry(2L, 500L,
                new TimetableEntryRequest(100L, 6L, 20L, "LAB-1")));
        verify(entryRepository, never()).save(any());
        verifyNoInteractions(timeSlotRepository);
    }

    @Test
    void shouldRejectEditWhenAnotherTeacherAssignmentConflicts() {
        TimetableEntry entry = TimetableEntry.builder().id(500L).timetable(mockTimetable)
                .timeSlot(mockSlot).subjectId(5L).teacherId(20L).roomNumber("LAB-1").build();
        when(entryRepository.findById(500L)).thenReturn(Optional.of(entry));
        when(timeSlotRepository.findById(100L)).thenReturn(Optional.of(mockSlot));
        when(entryRepository.findTeacherConflictExcludingEntry(100L, 30L, 500L))
                .thenReturn(Optional.of(TimetableEntry.builder().id(501L).timeSlot(mockSlot).build()));

        ScheduleConflictException exception = assertThrows(ScheduleConflictException.class,
                () -> timetableService.updateEntry(1L, 500L, new TimetableEntryRequest(100L, 6L, 30L, "LAB-1")));

        assertEquals(ScheduleConflictException.ConflictType.TEACHER_BUSY, exception.getConflictType());
        assertEquals(20L, entry.getTeacherId());
        verify(entryRepository, never()).save(any());
    }

    @Test
    void shouldReturnStudentTimetable() {
        com.sliit.sims.student.model.Student student = com.sliit.sims.student.model.Student.builder()
                .id(1L).admissionNumber("WYC-001").firstName("Kasun").lastName("Perera").build();
        com.sliit.sims.student.model.AcademicClass aClass = com.sliit.sims.student.model.AcademicClass.builder()
                .id(10L).className("GRADE 10-A").gradeLevel(10).academicYear(2026).build();
        com.sliit.sims.student.model.StudentClassAllocation alloc = com.sliit.sims.student.model.StudentClassAllocation.builder()
                .id(1L).student(student).academicClass(aClass).academicYear(2026)
                .status(com.sliit.sims.student.model.AllocationStatus.ACTIVE).build();

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(allocationRepository.findByStudentIdAndAcademicYearAndStatus(eq(1L), anyInt(), eq(com.sliit.sims.student.model.AllocationStatus.ACTIVE)))
                .thenReturn(Optional.of(alloc));
        when(timetableRepository.findByClassIdOrderByAcademicYearDescTermDesc(10L))
                .thenReturn(java.util.List.of(mockTimetable));

        var resp = timetableService.getStudentTimetable(1L);

        assertNotNull(resp);
        assertEquals(1L, resp.studentId());
        assertEquals("Kasun Perera", resp.studentName());
        assertEquals("GRADE 10-A", resp.className());
        assertEquals(10, resp.gradeLevel());
    }

    @Test
    void shouldReturnMyTimetableForStudentUser() {
        com.sliit.sims.common.auth.model.User user = com.sliit.sims.common.auth.model.User.builder()
                .id(4L).username("student1").email("student1@wycherley.lk").role(com.sliit.sims.common.auth.model.Role.STUDENT).build();
        com.sliit.sims.student.model.Student student = com.sliit.sims.student.model.Student.builder()
                .id(1L).userId(4L).admissionNumber("WYC-001").firstName("Kasun").lastName("Perera").build();
        com.sliit.sims.student.model.AcademicClass aClass = com.sliit.sims.student.model.AcademicClass.builder()
                .id(10L).className("GRADE 10-A").gradeLevel(10).academicYear(2026).build();
        com.sliit.sims.student.model.StudentClassAllocation alloc = com.sliit.sims.student.model.StudentClassAllocation.builder()
                .id(1L).student(student).academicClass(aClass).academicYear(2026)
                .status(com.sliit.sims.student.model.AllocationStatus.ACTIVE).build();

        when(userRepository.findByUsername("student1")).thenReturn(Optional.of(user));
        when(studentRepository.findByUserId(4L)).thenReturn(Optional.of(student));
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(allocationRepository.findByStudentIdAndAcademicYearAndStatus(eq(1L), anyInt(), eq(com.sliit.sims.student.model.AllocationStatus.ACTIVE)))
                .thenReturn(Optional.of(alloc));
        when(timetableRepository.findByClassIdOrderByAcademicYearDescTermDesc(10L))
                .thenReturn(java.util.List.of(mockTimetable));

        var resp = timetableService.getMyTimetable("student1");

        assertNotNull(resp);
        assertEquals("Kasun Perera", resp.studentName());
        assertEquals("WYC-001", resp.admissionNumber());
    }
}

