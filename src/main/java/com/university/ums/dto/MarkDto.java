package com.university.ums.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MarkDto {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;

    private String enrollmentNumber;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private String courseName;

    @NotBlank(message = "Exam type is required")
    private String examType;

    @NotNull(message = "Marks obtained is required")
    private Double marksObtained;

    @NotNull(message = "Total marks is required")
    private Double totalMarks;

    private String grade;

    private String academicYear;

    private Integer semester;
}