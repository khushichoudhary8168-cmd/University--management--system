package com.university.ums.service;

import com.university.ums.dto.LeaveApplicationDto;
import com.university.ums.entity.*;
import com.university.ums.exception.BadRequestException;
import com.university.ums.exception.ResourceNotFoundException;
import com.university.ums.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Autowired
    private CourseRepository courseRepository;

    // Get student profile by username
    public Student getStudentProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return studentRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
    }

    // Get enrolled courses for a student
    public List<Course> getMyEnrolledCourses(String username) {
        Student student = getStudentProfile(username);
        return enrollmentRepository.findByStudent_IdAndStatus(student.getId(), Enrollment.EnrollmentStatus.ACTIVE)
                .stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    // Enroll student in a course
    @Transactional
    public String enrollInCourse(String username, Long courseId) {
        Student student = getStudentProfile(username);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        if (enrollmentRepository.existsByStudent_IdAndCourse_Id(student.getId(), courseId)) {
            throw new BadRequestException("Already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);
        enrollmentRepository.save(enrollment);

        return "Successfully enrolled in " + course.getName();
    }

    // Get attendance for a student per course
    public Map<String, Object> getMyAttendance(String username, Long courseId) {
        Student student = getStudentProfile(username);

        List<Attendance> attendanceList = attendanceRepository
                .findByStudent_IdAndCourse_Id(student.getId(), courseId);

        long totalClasses = attendanceRepository
                .countTotalByStudentAndCourse(student.getId(), courseId);
        long presentCount = attendanceRepository
                .countPresentByStudentAndCourse(student.getId(), courseId);

        double percentage = totalClasses > 0
                ? Math.round((presentCount * 100.0 / totalClasses) * 10.0) / 10.0
                : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("totalClasses", totalClasses);
        result.put("present", presentCount);
        result.put("absent", totalClasses - presentCount);
        result.put("percentage", percentage);
        result.put("records", attendanceList);
        return result;
    }

    // Get all marks for a student
    public List<Mark> getMyMarks(String username) {
        Student student = getStudentProfile(username);
        return markRepository.findByStudent_Id(student.getId());
    }

    // Get marks by semester
    public List<Mark> getMyMarksBySemester(String username, Integer semester) {
        Student student = getStudentProfile(username);
        return markRepository.findByStudent_IdAndSemester(student.getId(), semester);
    }

    // Apply for leave
    @Transactional
    public LeaveApplication applyForLeave(String username, LeaveApplicationDto dto) {
        Student student = getStudentProfile(username);

        if (dto.getToDate().isBefore(dto.getFromDate())) {
            throw new BadRequestException("To date cannot be before from date");
        }

        LeaveApplication leave = new LeaveApplication();
        leave.setStudent(student);
        leave.setReason(dto.getReason());
        leave.setFromDate(dto.getFromDate());
        leave.setToDate(dto.getToDate());
        leave.setStatus(LeaveApplication.LeaveStatus.PENDING);
        leave.setAppliedAt(LocalDateTime.now());

        return leaveApplicationRepository.save(leave);
    }

    // View my leave applications
    public List<LeaveApplication> getMyLeaves(String username) {
        Student student = getStudentProfile(username);
        return leaveApplicationRepository.findByStudent_Id(student.getId());
    }

    // Get student marksheet (all marks grouped)
    public Map<String, Object> getMarksheet(String username) {
        Student student = getStudentProfile(username);
        List<Mark> marks = markRepository.findByStudent_Id(student.getId());

        double totalObtained = marks.stream()
                .mapToDouble(Mark::getMarksObtained).sum();
        double totalMax = marks.stream()
                .mapToDouble(Mark::getTotalMarks).sum();
        double percentage = totalMax > 0
                ? Math.round((totalObtained / totalMax * 100) * 10.0) / 10.0
                : 0.0;

        Map<String, Object> marksheet = new HashMap<>();
        marksheet.put("studentName", student.getUser().getFullName());
        marksheet.put("enrollmentNumber", student.getEnrollmentNumber());
        marksheet.put("marks", marks);
        marksheet.put("totalMarksObtained", totalObtained);
        marksheet.put("totalMaxMarks", totalMax);
        marksheet.put("percentage", percentage);
        return marksheet;
    }
}