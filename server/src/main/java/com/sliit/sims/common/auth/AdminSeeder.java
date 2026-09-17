package com.sliit.sims.common.auth;

import com.sliit.sims.common.auth.model.Role;
import com.sliit.sims.common.auth.model.User;
import com.sliit.sims.common.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsername("admin")) return;

        userRepository.save(User.builder()
                .username("admin")
                .email("admin@sliit.lk")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build());

        userRepository.save(User.builder()
                .username("teacher1")
                .email("teacher1@sliit.lk")
                .passwordHash(passwordEncoder.encode("teacher123"))
                .role(Role.TEACHER)
                .build());

        userRepository.save(User.builder()
                .username("student1")
                .email("student1@sliit.lk")
                .passwordHash(passwordEncoder.encode("student123"))
                .role(Role.STUDENT)
                .build());

        userRepository.save(User.builder()
                .username("head_academic")
                .email("academic@sliit.lk")
                .passwordHash(passwordEncoder.encode("academic123"))
                .role(Role.HEAD_OF_ACADEMIC)
                .build());

        userRepository.save(User.builder()
                .username("parent1")
                .email("parent1@sliit.lk")
                .passwordHash(passwordEncoder.encode("parent123"))
                .role(Role.PARENT)
                .build());
    }
}

