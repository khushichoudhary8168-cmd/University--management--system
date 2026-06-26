package com.university.ums.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FacultyCreateDto {

    // User fields
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNumber;

    // Faculty-specific fields
    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    private String designation;

    private String qualification;

    private String specialization;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}