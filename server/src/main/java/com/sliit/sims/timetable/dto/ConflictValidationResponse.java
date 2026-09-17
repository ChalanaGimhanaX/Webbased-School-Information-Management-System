package com.sliit.sims.timetable.dto;

public record ConflictValidationResponse(
    boolean valid,
    String message,
    String conflictType
) {
    public static ConflictValidationResponse ok() {
        return new ConflictValidationResponse(true, "No scheduling conflicts detected", null);
    }

    public static ConflictValidationResponse conflict(String message, String conflictType) {
        return new ConflictValidationResponse(false, message, conflictType);
    }
}

