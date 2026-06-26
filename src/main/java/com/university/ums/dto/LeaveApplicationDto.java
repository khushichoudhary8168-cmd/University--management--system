package com.university.ums.dto;

import com.university.ums.entity.LeaveApplication;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveApplicationDto {

    private Long id;

    private Long studentId;

    private String studentName;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotNull(message = "From date is required")
    private LocalDate fromDate;

    @NotNull(message = "To date is required")
    private LocalDate toDate;

    private LeaveApplication.LeaveStatus status;

    private String remarks;

    private LocalDateTime appliedAt;
}