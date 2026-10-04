// Parent module controller — provides endpoints for parent profile lookup.
// Used by the Parent Fee Portal to resolve parents.id from the authenticated userId.
package com.sliit.sims.parent.controller;

import com.sliit.sims.parent.model.Parent;
import com.sliit.sims.parent.repository.ParentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/parents")
@CrossOrigin(origins = "*")
public class ParentController {

    private final ParentRepository parentRepository;

    public ParentController(ParentRepository parentRepository) {
        this.parentRepository = parentRepository;
    }

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
}
