package com.university.ums;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UniversityManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniversityManagementApplication.class, args);
        System.out.println("  University Management System Started  ");
        System.out.println("  API running at: http://localhost:8080  ");
    }
}