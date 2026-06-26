package com.university.ums.controller;

import com.university.ums.dto.ApiResponse;
import com.university.ums.dto.DepartmentDto;
import com.university.ums.dto.FacultyCreateDto;
import com.university.ums.entity.Department;
import com.university.ums.entity.Faculty;
import com.university.ums.entity.User;
import com.university.ums.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ============ DASHBOARD ============

    // GET /api/admin/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", stats));
    }

    // ============ STUDENT MANAGEMENT ============

    // GET /api/admin/students/pending
    @GetMapping("/students/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingStudents() {
        List<User> students = adminService.getPendingStudents();
        return ResponseEntity.ok(ApiResponse.success("Pending students fetched", students));
    }

    // GET /api/admin/students
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<User>>> getAllStudents() {
        List<User> students = adminService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success("All students fetched", students));
    }

    // PUT /api/admin/students/{userId}/approve
    @PutMapping("/students/{userId}/approve")
    public ResponseEntity<ApiResponse<String>> approveStudent(@PathVariable Long userId) {
        String message = adminService.approveStudent(userId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    // PUT /api/admin/students/{userId}/reject
    @PutMapping("/students/{userId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectStudent(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "") String reason) {
        String message = adminService.rejectStudent(userId, reason);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    // ============ DEPARTMENT MANAGEMENT ============

    // GET /api/admin/departments
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments() {
        List<Department> departments = adminService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success("Departments fetched", departments));
    }

    // POST /api/admin/departments
    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<Department>> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        Department department = adminService.createDepartment(dto);
        return ResponseEntity.ok(ApiResponse.success("Department created", department));
    }

    // PUT /api/admin/departments/{id}
    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentDto dto) {
        Department department = adminService.updateDepartment(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Department updated", department));
    }

    // DELETE /api/admin/departments/{id}
    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        adminService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted"));
    }

    // ============ FACULTY MANAGEMENT ============

    // GET /api/admin/faculty
    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<Faculty>>> getAllFaculty() {
        List<Faculty> faculty = adminService.getAllFacultyDetails();
        return ResponseEntity.ok(ApiResponse.success("Faculty list fetched", faculty));
    }

    // POST /api/admin/faculty
    @PostMapping("/faculty")
    public ResponseEntity<ApiResponse<Faculty>> createFaculty(@Valid @RequestBody FacultyCreateDto dto) {
        Faculty faculty = adminService.createFaculty(dto);
        return ResponseEntity.ok(ApiResponse.success("Faculty created successfully", faculty));
    }
}