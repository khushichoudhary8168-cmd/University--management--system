package com.university.ums.service;

import com.university.ums.dto.DepartmentDto;
import com.university.ums.dto.FacultyCreateDto;
import com.university.ums.entity.*;
import com.university.ums.exception.BadRequestException;
import com.university.ums.exception.ResourceNotFoundException;
import com.university.ums.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ============ STUDENT VERIFICATION ============

    // Get all pending student registrations
    public List<User> getPendingStudents() {
        return userRepository.findByRoleAndStatus(User.Role.STUDENT, User.AccountStatus.PENDING);
    }

    // Approve a student
    @Transactional
    public String approveStudent(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() != User.Role.STUDENT) {
            throw new BadRequestException("User is not a student");
        }

        user.setStatus(User.AccountStatus.ACTIVE);
        userRepository.save(user);

        // Generate enrollment number
        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (student.getEnrollmentNumber() == null) {
            String enrollNum = "UMS" + System.currentTimeMillis() % 100000;
            student.setEnrollmentNumber(enrollNum);
            studentRepository.save(student);
        }

        return "Student approved. Enrollment number: " + student.getEnrollmentNumber();
    }

    // Reject a student
    @Transactional
    public String rejectStudent(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(User.AccountStatus.REJECTED);
        userRepository.save(user);
        return "Student rejected.";
    }

    // Get all students
    public List<User> getAllStudents() {
        return userRepository.findByRole(User.Role.STUDENT);
    }

    // Get all faculty
    public List<User> getAllFaculty() {
        return userRepository.findByRole(User.Role.FACULTY);
    }

    // ============ DEPARTMENT MANAGEMENT ============

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional
    public Department createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists: " + dto.getCode());
        }
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department name already exists: " + dto.getName());
        }

        Department department = new Department();
        department.setName(dto.getName());
        department.setCode(dto.getCode());
        department.setDescription(dto.getDescription());
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        return departmentRepository.save(department);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        departmentRepository.delete(department);
    }

    // ============ FACULTY MANAGEMENT ============

    @Transactional
    public Faculty createFaculty(FacultyCreateDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("Username already taken: " + dto.getUsername());
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }
        if (facultyRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists: " + dto.getEmployeeId());
        }

        // Create User record
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setRole(User.Role.FACULTY);
        user.setStatus(User.AccountStatus.ACTIVE);
        userRepository.save(user);

        // Create Faculty record
        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + dto.getDepartmentId()));

        Faculty faculty = new Faculty();
        faculty.setUser(user);
        faculty.setEmployeeId(dto.getEmployeeId());
        faculty.setDesignation(dto.getDesignation());
        faculty.setQualification(dto.getQualification());
        faculty.setSpecialization(dto.getSpecialization());
        faculty.setDepartment(department);
        return facultyRepository.save(faculty);
    }

    public List<Faculty> getAllFacultyDetails() {
        return facultyRepository.findAll();
    }

    // ============ REPORTING ============

    public Map<String, Object> getDashboardStats() {
        long totalStudents = userRepository.findByRole(User.Role.STUDENT).size();
        long pendingStudents = getPendingStudents().size();
        long totalFaculty = userRepository.findByRole(User.Role.FACULTY).size();
        long totalDepartments = departmentRepository.count();

        return Map.of(
                "totalStudents", totalStudents,
                "pendingApprovals", pendingStudents,
                "totalFaculty", totalFaculty,
                "totalDepartments", totalDepartments);
    }
}