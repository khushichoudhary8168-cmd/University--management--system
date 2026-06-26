package com.university.ums.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseDto {

    private Long id;

    @NotBlank(message = "Course name is required")
    private String name;

    @NotBlank(message = "Course code is required")
    private String code;

    private String description;

    private Integer credits;

    private Integer semester;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private String departmentName;

    private Long facultyId;

    private String facultyName;
}