// Assigned module owner: IT25101863
package com.sliit.sims.attendance.service;

import com.sliit.sims.attendance.model.AttendanceRecord;
import com.sliit.sims.attendance.repository.AttendanceRecordRepository;
import com.sliit.sims.attendance.repository.AttendanceEntryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {
    @Mock AttendanceRecordRepository recordRepository;
    @Mock AttendanceEntryRepository entryRepository;
    @InjectMocks AttendanceService service;

    @Test
    void lockedAttendanceCannotBeDeleted() {
        AttendanceRecord record = AttendanceRecord.builder().id(1L).isLocked(true).build();
        when(recordRepository.findById(1L)).thenReturn(Optional.of(record));
        assertThrows(IllegalStateException.class, () -> service.deleteAttendance(1L));
        verify(recordRepository, never()).delete(any());
    }

    @Test
    void unlockedAttendanceCanBeDeleted() {
        AttendanceRecord record = AttendanceRecord.builder().id(1L).isLocked(false).build();
        when(recordRepository.findById(1L)).thenReturn(Optional.of(record));
        service.deleteAttendance(1L);
        verify(recordRepository).delete(record);
    }
}
