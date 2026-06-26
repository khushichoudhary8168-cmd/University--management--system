package com.university.ums.dto;

import com.university.ums.entity.Attendance;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceDto {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private String courseName;

    @NotNull(message = "Date is required")
    private LocalDate attendanceDate;

    @NotNull(message = "Status is required")
    private Attendance.AttendanceStatus status;
}