package com.sliit.sims.assistant.controller;

import com.sliit.sims.assistant.dto.AssistantChatRequest;
import com.sliit.sims.assistant.dto.AssistantChatResponse;
import com.sliit.sims.assistant.dto.AssistantStatusResponse;
import com.sliit.sims.assistant.dto.StudentOverviewResponse;
import com.sliit.sims.assistant.service.AssistantChatService;
import com.sliit.sims.assistant.service.StudentOverviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/** Student-only AI assistant ("Study Buddy"). Also guarded by a URL rule in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/assistant")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class AssistantController {

    private final AssistantChatService chatService;
    private final StudentOverviewService overviewService;

    @GetMapping("/status")
    public AssistantStatusResponse status() {
        return chatService.status();
    }

    @GetMapping("/overview")
    public StudentOverviewResponse overview(Principal principal) {
        return overviewService.getOverview(principal.getName());
    }

    @PostMapping("/chat")
    public AssistantChatResponse chat(@Valid @RequestBody AssistantChatRequest request, Principal principal) {
        return chatService.chat(principal.getName(), request);
    }
}

