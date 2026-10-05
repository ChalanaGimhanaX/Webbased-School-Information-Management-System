// Parent module controller — provides endpoints for parent profile lookup and children reports.
package com.sliit.sims.parent.controller;

import com.sliit.sims.parent.dto.ChildAcademicReportResponse;
import com.sliit.sims.parent.model.Parent;
import com.sliit.sims.parent.repository.ParentRepository;
import com.sliit.sims.parent.service.ParentService;
import com.sliit.sims.student.dto.StudentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ParentController {

    private final ParentRepository parentRepository;
    private final ParentService parentService;

    /**
     * Returns the Parent entity (including its id) for a given users.id.
     * The frontend calls this on login to store the parentId for the fee portal.
     */
    @GetMapping("/by-user/{userId}")
    public Parent getParentByUserId(@PathVariable Long userId) {
        return parentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No parent profile found for userId: " + userId));
    }

    /**
     * Returns the authenticated parent's children.
     */
    @GetMapping("/my-children")
    public List<StudentResponse> getMyChildren(Principal principal) {
        return parentService.getChildrenByUsername(principal.getName());
    }

    /**
     * Returns the children belonging to a specific parentId.
     */
    @GetMapping("/{parentId}/children")
    public List<StudentResponse> getChildrenByParentId(@PathVariable Long parentId) {
        return parentService.getChildrenByParentId(parentId);
    }

    /**
     * Returns comprehensive academic and exam reports for a specific child.
     */
    @GetMapping("/children/{studentId}/report")
    public ChildAcademicReportResponse getChildReport(@PathVariable Long studentId) {
        return parentService.getChildAcademicReport(studentId);
    }

    /**
     * Returns comprehensive academic and exam reports for a child under a specific parentId.
     */
    @GetMapping("/{parentId}/children/{studentId}/report")
    public ChildAcademicReportResponse getChildReportWithParent(@PathVariable Long parentId, @PathVariable Long studentId) {
        return parentService.getChildAcademicReport(studentId);
    }
}

