// Assigned module owner: IT25101913
package com.sliit.sims.common.exception;

import lombok.Getter;

@Getter
public class ScheduleConflictException extends RuntimeException {

    public enum ConflictType {
        TEACHER_BUSY,
        ROOM_OCCUPIED,
        CLASS_SLOT_TAKEN
    }

    private final ConflictType conflictType;

    public ScheduleConflictException(ConflictType conflictType, String message) {
        super(message);
        this.conflictType = conflictType;
    }
}

