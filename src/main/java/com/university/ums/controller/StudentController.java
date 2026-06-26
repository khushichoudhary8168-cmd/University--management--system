package com.university.ums.controller;

import com.university.ums.dto.ApiResponse;
import com.university.ums.dto.LeaveApplicationDto;
import com.university.ums.entity.*;
import com.university.ums.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private StudentService studentService;

    // GET /api/student/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Student>> getProfile(Authentication auth) {
        Student student = studentService.getStudentProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", student));
    }

    // GET /api/student/courses
    // View all enrolled courses
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<Course>>> getEnrolledCourses(Authentication auth) {
        List<Course> courses = studentService.getMyEnrolledCourses(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Enrolled courses fetched", courses));
    }

    // POST /api/student/courses/{courseId}/enroll
    // Enroll in a course
    @PostMapping("/courses/{courseId}/enroll")
    public ResponseEntity<ApiResponse<String>> enrollCourse(
            @PathVariable Long courseId, Authentication auth) {
        String msg = studentService.enrollInCourse(auth.getName(), courseId);
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    // GET /api/student/attendance/{courseId}
    // View attendance for a specific course
    @GetMapping("/attendance/{courseId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendance(
            @PathVariable Long courseId, Authentication auth) {
        Map<String, Object> attendance = studentService.getMyAttendance(auth.getName(), courseId);
        return ResponseEntity.ok(ApiResponse.success("Attendance fetched", attendance));
    }

    // GET /api/student/marks
    // View all marks
    @GetMapping("/marks")
    public ResponseEntity<ApiResponse<List<Mark>>> getMarks(Authentication auth) {
        List<Mark> marks = studentService.getMyMarks(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Marks fetched", marks));
    }

    // GET /api/student/marks/semester/{semester}
    // View marks by semester
    @GetMapping("/marks/semester/{semester}")
    public ResponseEntity<ApiResponse<List<Mark>>> getMarksBySemester(
            @PathVariable Integer semester, Authentication auth) {
        List<Mark> marks = studentService.getMyMarksBySemester(auth.getName(), semester);
        return ResponseEntity.ok(ApiResponse.success("Marks fetched", marks));
    }

    // GET /api/student/marksheet
    // Download/view full marksheet
    @GetMapping("/marksheet")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMarksheet(Authentication auth) {
        Map<String, Object> marksheet = studentService.getMarksheet(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Marksheet generated", marksheet));
    }

    // POST /api/student/leaves
    // Apply for leave
    @PostMapping("/leaves")
    public ResponseEntity<ApiResponse<LeaveApplication>> applyLeave(
            @Valid @RequestBody LeaveApplicationDto dto, Authentication auth) {
        LeaveApplication leave = studentService.applyForLeave(auth.getName(), dto);
        return ResponseEntity.ok(ApiResponse.success("Leave application submitted", leave));
    }

    // GET /api/student/leaves
    // View my leave applications
    @GetMapping("/leaves")
    public ResponseEntity<ApiResponse<List<LeaveApplication>>> getLeaves(Authentication auth) {
        List<LeaveApplication> leaves = studentService.getMyLeaves(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Leave applications fetched", leaves));
    }
}