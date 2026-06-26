package com.university.ums.service;

import com.university.ums.dto.AuthResponse;
import com.university.ums.dto.LoginRequest;
import com.university.ums.dto.RegisterRequest;
import com.university.ums.entity.Student;
import com.university.ums.entity.User;
import com.university.ums.exception.BadRequestException;
import com.university.ums.repository.DepartmentRepository;
import com.university.ums.repository.StudentRepository;
import com.university.ums.repository.UserRepository;
import com.university.ums.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    // Login - works for all roles
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
        } catch (DisabledException e) {
            throw new BadRequestException("Your account is pending admin approval. Please wait.");
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid username or password.");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getStatus() == User.AccountStatus.PENDING) {
            throw new BadRequestException("Account is pending verification by admin.");
        }
        if (user.getStatus() == User.AccountStatus.REJECTED) {
            throw new BadRequestException("Your account has been rejected. Contact admin.");
        }
        if (user.getStatus() == User.AccountStatus.INACTIVE) {
            throw new BadRequestException("Your account is inactive. Contact admin.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getRole().name(),
                user.getFullName(), user.getStatus().name());
    }

    // Student self-registration - starts as PENDING, admin must verify
    @Transactional
    public String registerStudent(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        // Create User record
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(User.Role.STUDENT);
        user.setStatus(User.AccountStatus.PENDING); // must be approved by admin
        userRepository.save(user);

        // Create Student profile
        Student student = new Student();
        student.setUser(user);
        student.setDateOfBirth(request.getDateOfBirth());
        student.setAddress(request.getAddress());
        student.setGender(request.getGender());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianPhone(request.getGuardianPhone());
        student.setAdmissionYear(Year.now().getValue());

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .ifPresent(student::setDepartment);
        }

        studentRepository.save(student);

        return "Registration successful! Your account is pending admin approval.";
    }
}