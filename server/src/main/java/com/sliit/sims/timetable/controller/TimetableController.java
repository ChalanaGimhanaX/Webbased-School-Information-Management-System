// Assigned module owner: IT25101913
package com.sliit.sims.timetable.controller;

import com.sliit.sims.teacher.dto.SubjectCreateRequest;
import com.sliit.sims.teacher.dto.SubjectResponse;
import com.sliit.sims.teacher.service.TeacherService;
import com.sliit.sims.timetable.dto.*;
import com.sliit.sims.timetable.model.TimeSlot;
import com.sliit.sims.timetable.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timetables")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimetableController {

    private final TimetableService timetableService;
    private final TeacherService teacherService;

    @GetMapping("/subjects")
    public List<SubjectResponse> getSubjects(@RequestParam(required = false) Integer grade) {
        if (grade != null) {
            return teacherService.getSubjectsByGrade(grade);
        }
        return teacherService.getAllSubjects();
    }

    @PostMapping("/subjects")
    @ResponseStatus(HttpStatus.CREATED)
    public SubjectResponse createSubject(@Valid @RequestBody SubjectCreateRequest req) {
        return teacherService.createSubject(req);
    }

    @PutMapping("/subjects/{id}")
    public SubjectResponse updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectCreateRequest req) {
        return teacherService.updateSubject(id, req);
    }

    @DeleteMapping("/subjects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSubject(@PathVariable Long id) {
        teacherService.deleteSubject(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimetableResponse create(@Valid @RequestBody TimetableCreateRequest req) {
        return timetableService.createTimetable(req);
    }

    @GetMapping("/{id}")
    public TimetableResponse getById(@PathVariable Long id) {
        return timetableService.getTimetable(id);
    }

    @GetMapping("/class/{classId}")
    public List<TimetableResponse> getByClass(@PathVariable Long classId) {
        return timetableService.getTimetablesByClass(classId);
    }

    @PostMapping("/{id}/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public TimetableEntryResponse addEntry(@PathVariable Long id, @Valid @RequestBody TimetableEntryRequest req) {
        return timetableService.addEntry(id, req);
    }

    @PutMapping("/{id}/entries/{entryId}")
    public TimetableEntryResponse updateEntry(
            @PathVariable Long id,
            @PathVariable Long entryId,
            @Valid @RequestBody TimetableEntryRequest req) {
        return timetableService.updateEntry(id, entryId, req);
    }

    @PostMapping("/{id}/validate-slot")
    public ConflictValidationResponse validateSlot(@PathVariable Long id, @Valid @RequestBody TimetableEntryRequest req) {
        return timetableService.validateSlot(id, req);
    }

    @DeleteMapping("/{id}/entries/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(@PathVariable Long id, @PathVariable Long entryId) {
        timetableService.deleteEntry(id, entryId);
    }

    @PatchMapping("/{id}/publish")
    public TimetableResponse publish(@PathVariable Long id) {
        return timetableService.publishTimetable(id);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<TimetableEntryResponse> getTeacherSchedule(@PathVariable Long teacherId) {
        return timetableService.getTeacherSchedule(teacherId);
    }

    @GetMapping("/room/{roomNumber}")
    public List<TimetableEntryResponse> getRoomSchedule(@PathVariable String roomNumber) {
        return timetableService.getRoomSchedule(roomNumber);
    }

    @GetMapping("/slots")
    public List<TimeSlot> getAllSlots() {
        return timetableService.getAllTimeSlots();
    }

    @GetMapping("/my-timetable")
    public StudentTimetableResponse getMyTimetable(java.security.Principal principal) {
        return timetableService.getMyTimetable(principal.getName());
    }

    @GetMapping("/student/{studentId}")
    public StudentTimetableResponse getStudentTimetable(@PathVariable Long studentId) {
        return timetableService.getStudentTimetable(studentId);
    }

    @GetMapping("/class/{classId}/student-view")
    public StudentTimetableResponse getClassStudentView(@PathVariable Long classId) {
        return timetableService.getClassTimetableStudentView(classId);
    }
}
