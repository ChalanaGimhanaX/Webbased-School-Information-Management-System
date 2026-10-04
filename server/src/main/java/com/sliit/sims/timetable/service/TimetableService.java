// Assigned module owner: IT25101913
package com.sliit.sims.timetable.service;

import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.common.exception.ScheduleConflictException;
import com.sliit.sims.common.exception.ScheduleConflictException.ConflictType;
import com.sliit.sims.student.model.AcademicClass;
import com.sliit.sims.student.model.AllocationStatus;
import com.sliit.sims.student.model.Student;
import com.sliit.sims.student.model.StudentClassAllocation;
import com.sliit.sims.student.repository.AcademicClassRepository;
import com.sliit.sims.student.repository.StudentClassAllocationRepository;
import com.sliit.sims.student.repository.StudentRepository;
import com.sliit.sims.teacher.model.Subject;
import com.sliit.sims.teacher.model.Teacher;
import com.sliit.sims.teacher.repository.SubjectRepository;
import com.sliit.sims.teacher.repository.TeacherRepository;
import com.sliit.sims.common.auth.model.User;
import com.sliit.sims.common.auth.repository.UserRepository;
import com.sliit.sims.timetable.dto.*;
import com.sliit.sims.timetable.model.*;
import com.sliit.sims.timetable.repository.TimeSlotRepository;
import com.sliit.sims.timetable.repository.TimetableEntryRepository;
import com.sliit.sims.timetable.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final TimetableEntryRepository entryRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final StudentRepository studentRepository;
    private final StudentClassAllocationRepository allocationRepository;
    private final AcademicClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    @Transactional
    public TimetableResponse createTimetable(TimetableCreateRequest req) {
        timetableRepository.findByClassIdAndAcademicYearAndTerm(req.classId(), req.academicYear(), req.term())
                .ifPresent(existing -> {
                    throw new ScheduleConflictException(ConflictType.CLASS_SLOT_TAKEN,
                            "Timetable already exists for class " + req.classId() + " in term " + req.term());
                });

        Timetable timetable = Timetable.builder()
                .classId(req.classId())
                .academicYear(req.academicYear())
                .term(req.term())
                .status(TimetableStatus.DRAFT)
                .build();

        return mapToResponse(timetableRepository.save(timetable));
    }

    @Transactional
    public TimetableEntryResponse addEntry(Long timetableId, TimetableEntryRequest req) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found: " + timetableId));

        TimeSlot timeSlot = timeSlotRepository.findById(req.timeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found: " + req.timeSlotId()));

        checkConflicts(timetableId, req.timeSlotId(), req.teacherId(), req.roomNumber());

        TimetableEntry entry = TimetableEntry.builder()
                .timetable(timetable)
                .timeSlot(timeSlot)
                .subjectId(req.subjectId())
                .teacherId(req.teacherId())
                .roomNumber(req.roomNumber().trim().toUpperCase())
                .build();

        return mapToEntryResponse(entryRepository.save(entry));
    }

    @Transactional
    public TimetableEntryResponse updateEntry(Long timetableId, Long entryId, TimetableEntryRequest req) {
        TimetableEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found: " + entryId));

        if (!entry.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Entry does not belong to timetable " + timetableId);
        }

        TimeSlot timeSlot = timeSlotRepository.findById(req.timeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found: " + req.timeSlotId()));

        checkConflictsForUpdate(timetableId, entryId, req.timeSlotId(), req.teacherId(), req.roomNumber());

        entry.setTimeSlot(timeSlot);
        entry.setSubjectId(req.subjectId());
        entry.setTeacherId(req.teacherId());
        entry.setRoomNumber(req.roomNumber().trim().toUpperCase());

        return mapToEntryResponse(entryRepository.save(entry));
    }

    public ConflictValidationResponse validateSlot(Long timetableId, TimetableEntryRequest req) {
        try {
            checkConflicts(timetableId, req.timeSlotId(), req.teacherId(), req.roomNumber());
            return ConflictValidationResponse.ok();
        } catch (ScheduleConflictException ex) {
            return ConflictValidationResponse.conflict(ex.getMessage(), ex.getConflictType().name());
        }
    }

    private void checkConflicts(Long timetableId, Long slotId, Long teacherId, String roomNumber) {
        entryRepository.findClassSlotConflict(timetableId, slotId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.CLASS_SLOT_TAKEN,
                    "This class already has a subject assigned to period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findTeacherConflict(slotId, teacherId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.TEACHER_BUSY,
                    "Teacher " + teacherId + " is already assigned to another class during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findRoomConflict(slotId, roomNumber.trim()).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.ROOM_OCCUPIED,
                    "Room " + roomNumber + " is already occupied during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });
    }

    private void checkConflictsForUpdate(Long timetableId, Long entryId, Long slotId, Long teacherId, String roomNumber) {
        entryRepository.findClassSlotConflictExcludingEntry(timetableId, slotId, entryId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.CLASS_SLOT_TAKEN,
                    "This class already has a subject assigned to period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findTeacherConflictExcludingEntry(slotId, teacherId, entryId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.TEACHER_BUSY,
                    "Teacher " + teacherId + " is already assigned to another class during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findRoomConflictExcludingEntry(slotId, roomNumber.trim(), entryId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.ROOM_OCCUPIED,
                    "Room " + roomNumber + " is already occupied during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });
    }

    @Transactional
    public void deleteEntry(Long timetableId, Long entryId) {
        TimetableEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found: " + entryId));

        if (!entry.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Entry does not belong to timetable " + timetableId);
        }
        entryRepository.delete(entry);
    }

    @Transactional
    public TimetableResponse publishTimetable(Long timetableId) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found: " + timetableId));

        if (timetable.getEntries().isEmpty()) {
            throw new IllegalStateException("Cannot publish an empty timetable");
        }

        timetable.setStatus(TimetableStatus.PUBLISHED);
        return mapToResponse(timetableRepository.save(timetable));
    }

    public TimetableResponse getTimetable(Long id) {
        return timetableRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found: " + id));
    }

    public List<TimetableResponse> getTimetablesByClass(Long classId) {
        return timetableRepository.findByClassIdOrderByAcademicYearDescTermDesc(classId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TimetableEntryResponse> getTeacherSchedule(Long teacherId) {
        return entryRepository.findPublishedEntriesByTeacher(teacherId)
                .stream()
                .map(this::mapToEntryResponse)
                .toList();
    }

    public List<TimetableEntryResponse> getRoomSchedule(String roomNumber) {
        return entryRepository.findPublishedEntriesByRoom(roomNumber.trim())
                .stream()
                .map(this::mapToEntryResponse)
                .toList();
    }

    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAllByOrderByDayOfWeekAscPeriodNumberAsc();
    }

    public StudentTimetableResponse getStudentTimetable(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        int currentYear = LocalDate.now().getYear();
        StudentClassAllocation allocation = allocationRepository
                .findByStudentIdAndAcademicYearAndStatus(studentId, currentYear, AllocationStatus.ACTIVE)
                .or(() -> allocationRepository.findAll().stream()
                        .filter(a -> a.getStudent().getId().equals(studentId) && a.getStatus() == AllocationStatus.ACTIVE)
                        .findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("No active class allocation found for student: " + student.getFirstName() + " " + student.getLastName()));

        AcademicClass academicClass = allocation.getAcademicClass();
        return buildStudentTimetable(student, academicClass);
    }

    public StudentTimetableResponse getMyTimetable(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No student profile found for user account: " + username));

        return getStudentTimetable(student.getId());
    }

    public StudentTimetableResponse getClassTimetableStudentView(Long classId) {
        AcademicClass academicClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + classId));

        return buildStudentTimetable(null, academicClass);
    }

    private StudentTimetableResponse buildStudentTimetable(Student student, AcademicClass academicClass) {
        List<Timetable> timetables = timetableRepository.findByClassIdOrderByAcademicYearDescTermDesc(academicClass.getId());
        if (timetables.isEmpty()) {
            return new StudentTimetableResponse(
                    student != null ? student.getId() : null,
                    student != null ? (student.getFirstName() + " " + student.getLastName()) : null,
                    student != null ? student.getAdmissionNumber() : null,
                    academicClass.getId(),
                    academicClass.getClassName(),
                    academicClass.getGradeLevel(),
                    academicClass.getAcademicYear(),
                    1,
                    "UNAVAILABLE",
                    List.of()
            );
        }

        Timetable activeTimetable = timetables.stream()
                .filter(t -> t.getStatus() == TimetableStatus.PUBLISHED)
                .findFirst()
                .orElse(timetables.get(0));

        List<StudentTimetableSlotDto> slotDtos = activeTimetable.getEntries().stream()
                .map(e -> {
                    String subjectName = subjectRepository.findById(e.getSubjectId())
                            .map(Subject::getSubjectName)
                            .orElse("Subject #" + e.getSubjectId());
                    String subjectCode = subjectRepository.findById(e.getSubjectId())
                            .map(Subject::getSubjectCode)
                            .orElse("SUB-" + e.getSubjectId());
                    String teacherName = teacherRepository.findById(e.getTeacherId())
                            .map(t -> t.getFirstName() + " " + t.getLastName())
                            .orElse("Teacher #" + e.getTeacherId());

                    return new StudentTimetableSlotDto(
                            e.getId(),
                            e.getTimeSlot().getDayOfWeek().name(),
                            e.getTimeSlot().getPeriodNumber(),
                            e.getTimeSlot().getStartTime(),
                            e.getTimeSlot().getEndTime(),
                            e.getSubjectId(),
                            subjectCode,
                            subjectName,
                            e.getTeacherId(),
                            teacherName,
                            e.getRoomNumber()
                    );
                })
                .toList();

        return new StudentTimetableResponse(
                student != null ? student.getId() : null,
                student != null ? (student.getFirstName() + " " + student.getLastName()) : null,
                student != null ? student.getAdmissionNumber() : null,
                academicClass.getId(),
                academicClass.getClassName(),
                academicClass.getGradeLevel(),
                activeTimetable.getAcademicYear(),
                activeTimetable.getTerm(),
                activeTimetable.getStatus().name(),
                slotDtos
        );
    }

    private TimetableResponse mapToResponse(Timetable t) {
        List<TimetableEntryResponse> entries = t.getEntries().stream()
                .map(this::mapToEntryResponse)
                .toList();

        return new TimetableResponse(
                t.getId(),
                t.getClassId(),
                t.getAcademicYear(),
                t.getTerm(),
                t.getStatus(),
                entries,
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }

    private TimetableEntryResponse mapToEntryResponse(TimetableEntry e) {
        return new TimetableEntryResponse(
                e.getId(),
                e.getTimeSlot().getId(),
                e.getTimeSlot().getDayOfWeek().name(),
                e.getTimeSlot().getPeriodNumber(),
                e.getTimeSlot().getStartTime(),
                e.getTimeSlot().getEndTime(),
                e.getSubjectId(),
                e.getTeacherId(),
                e.getRoomNumber()
        );
    }
}

