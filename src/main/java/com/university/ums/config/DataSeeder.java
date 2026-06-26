package com.university.ums.config;

import com.university.ums.entity.User;
import com.university.ums.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // Create default ADMIN if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@university.com");
            admin.setFullName("System Administrator");
            admin.setRole(User.Role.ADMIN);
            admin.setStatus(User.AccountStatus.ACTIVE);
            userRepository.save(admin);
            System.out.println("Default Admin created  →  username: admin  |  password: admin123");
        }

        // Create a test Admission Officer
        if (!userRepository.existsByUsername("admission_officer")) {
            User officer = new User();
            officer.setUsername("admission_officer");
            officer.setPassword(passwordEncoder.encode("officer123"));
            officer.setEmail("officer@university.com");
            officer.setFullName("Admission Officer");
            officer.setRole(User.Role.ADMISSION_OFFICER);
            officer.setStatus(User.AccountStatus.ACTIVE);
            userRepository.save(officer);
            System.out.println("Default Admission Officer created  →  username: admission_officer  |  password: officer123");
        }
        System.out.println("  Seeding complete. Backend is READY.");
        System.out.println("  API Base URL: http://localhost:8080/api");
    }
}