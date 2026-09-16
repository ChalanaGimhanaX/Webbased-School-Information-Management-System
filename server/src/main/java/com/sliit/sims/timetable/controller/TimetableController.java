package com.sliit.sims.timetable.controller;

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
}
