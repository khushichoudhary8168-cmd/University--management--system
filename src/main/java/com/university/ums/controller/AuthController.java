package com.university.ums.controller;

import com.university.ums.dto.ApiResponse;
import com.university.ums.dto.AuthResponse;
import com.university.ums.dto.LoginRequest;
import com.university.ums.dto.RegisterRequest;
import com.university.ums.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    // POST /api/auth/login
    // Used by ADMIN, FACULTY, STUDENT, ADMISSION_OFFICER
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // POST /api/auth/register
    // Student self-registration — account starts as PENDING until admin approves
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.registerStudent(request);
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }
}