package com.university.ums.controller;

import com.university.ums.dto.ApiResponse;
import com.university.ums.dto.CourseDto;
import com.university.ums.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // GET /api/courses  — all roles can see courses
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success("Courses fetched", courseService.getAllCourses()));
    }

    // GET /api/courses/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Course fetched", courseService.getCourseById(id)));
    }

    // GET /api/courses/department/{departmentId}
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getCoursesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(ApiResponse.success("Courses fetched",
                courseService.getCoursesByDepartment(departmentId)));
    }

    // GET /api/courses/faculty/{facultyId}
    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getCoursesByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success("Courses fetched",
                courseService.getCoursesByFaculty(facultyId)));
    }

    // POST /api/courses  — ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@Valid @RequestBody CourseDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Course created", courseService.createCourse(dto)));
    }

    // PUT /api/courses/{id}  — ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(
            @PathVariable Long id, @Valid @RequestBody CourseDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Course updated", courseService.updateCourse(id, dto)));
    }

    // DELETE /api/courses/{id}  — ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted"));
    }

    // PUT /api/courses/{courseId}/assign-faculty/{facultyId}  — ADMIN only
    @PutMapping("/{courseId}/assign-faculty/{facultyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> assignFaculty(
            @PathVariable Long courseId,
            @PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success("Faculty assigned",
                courseService.assignFacultyToCourse(courseId, facultyId)));
    }
}