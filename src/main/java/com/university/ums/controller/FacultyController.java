package com.university.ums.controller;

import com.university.ums.dto.ApiResponse;
import com.university.ums.dto.AttendanceDto;
import com.university.ums.dto.MarkDto;
import com.university.ums.entity.*;
import com.university.ums.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    // GET /api/faculty/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Faculty>> getProfile(Authentication auth) {
        Faculty faculty = facultyService.getFacultyProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", faculty));
    }

    // GET /api/faculty/dashboard
    // Shows total students, total courses
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(Authentication auth) {
        Map<String, Object> dashboard = facultyService.getFacultyDashboard(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Dashboard fetched", dashboard));
    }

    // GET /api/faculty/courses
    // Get all courses assigned to this faculty
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<Course>>> getMyCourses(Authentication auth) {
        List<Course> courses = facultyService.getMyCourses(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Courses fetched", courses));
    }

    // GET /api/faculty/courses/{courseId}/students
    // Get all students enrolled in a course
    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<ApiResponse<List<Student>>> getStudentsInCourse(@PathVariable Long courseId) {
        List<Student> students = facultyService.getStudentsInCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Students fetched", students));
    }

    // POST /api/faculty/attendance
    // Mark attendance — send a list of attendance records
    @PostMapping("/attendance")
    public ResponseEntity<ApiResponse<String>> markAttendance(
            @Valid @RequestBody List<AttendanceDto> attendanceDtos,
            Authentication auth) {
        String msg = facultyService.markAttendance(auth.getName(), attendanceDtos);
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    // POST /api/faculty/marks
    // Upload marks for a student in a course
    @PostMapping("/marks")
    public ResponseEntity<ApiResponse<Mark>> uploadMarks(
            @Valid @RequestBody MarkDto dto,
            Authentication auth) {
        Mark mark = facultyService.uploadMark(auth.getName(), dto);
        return ResponseEntity.ok(ApiResponse.success("Marks uploaded", mark));
    }

    // GET /api/faculty/report/student/{studentId}/course/{courseId}
    // Full student report: marks + attendance
    @GetMapping("/report/student/{studentId}/course/{courseId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentReport(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        Map<String, Object> report = facultyService.getStudentReport(studentId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Student report fetched", report));
    }

    // GET /api/faculty/leaves/pending
    // View all pending leave applications
    @GetMapping("/leaves/pending")
    public ResponseEntity<ApiResponse<List<LeaveApplication>>> getPendingLeaves() {
        List<LeaveApplication> leaves = facultyService.getPendingLeaves();
        return ResponseEntity.ok(ApiResponse.success("Pending leaves fetched", leaves));
    }

    // PUT /api/faculty/leaves/{leaveId}/review
    // Approve or reject a leave
    @PutMapping("/leaves/{leaveId}/review")
    public ResponseEntity<ApiResponse<String>> reviewLeave(
            @PathVariable Long leaveId,
            @RequestParam String decision,
            @RequestParam(required = false, defaultValue = "") String remarks) {
        String msg = facultyService.reviewLeave(leaveId, decision, remarks);
        return ResponseEntity.ok(ApiResponse.success(msg));
    }
}