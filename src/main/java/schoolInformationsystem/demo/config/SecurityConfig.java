package schoolInformationsystem.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Encrypts plain-text passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Predefined in-memory users for testing role-based access
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {

        UserDetails principal = User.builder()
                .username("principal")
                .password(encoder.encode("principal123"))
                .roles("PRINCIPAL", "ADMIN")
                .build();

        UserDetails admin = User.builder()
                .username("admin")
                .password(encoder.encode("admin123"))
                .roles("ADMIN")
                .build();

        UserDetails teacher = User.builder()
                .username("teacher")
                .password(encoder.encode("teacher123"))
                .roles("TEACHER")
                .build();

        UserDetails student = User.builder()
                .username("student")
                .password(encoder.encode("student123"))
                .roles("STUDENT")
                .build();

        UserDetails parent = User.builder()
                .username("parent")
                .password(encoder.encode("parent123"))
                .roles("PARENT")
                .build();

        return new InMemoryUserDetailsManager(principal, admin, teacher, student, parent);
    }

    // Configures route access rules and role-based login redirection
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // Public assets and database console
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/h2-console/**").permitAll()

                        // CRUD write operations restricted to PRINCIPAL, ADMIN, and TEACHER
                        .requestMatchers("/exams/save", "/exams/update", "/exams/delete/**").hasAnyRole("PRINCIPAL", "ADMIN", "TEACHER")
                        .requestMatchers("/subjects/save", "/subjects/delete/**").hasAnyRole("PRINCIPAL", "ADMIN", "TEACHER")
                        .requestMatchers("/marks/**").hasAnyRole("PRINCIPAL", "ADMIN", "TEACHER")

                        // Administration dashboards and reports
                        .requestMatchers("/exams", "/subjects", "/analytics").hasAnyRole("PRINCIPAL", "ADMIN", "TEACHER")

                        // Result portals accessible to all authenticated roles (including STUDENTS and PARENTS)
                        .requestMatchers("/", "/portal/**", "/reports/**").hasAnyRole("STUDENT", "PARENT", "TEACHER", "ADMIN", "PRINCIPAL")

                        .anyRequest().authenticated()
                )
                // Role-based redirection after login
                .formLogin(form -> form
                        .successHandler((request, response, authentication) -> {
                            boolean isViewOnlyUser = authentication.getAuthorities().stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .anyMatch(role -> role.equals("ROLE_STUDENT") || role.equals("ROLE_PARENT"));

                            if (isViewOnlyUser) {
                                response.sendRedirect("/portal");
                            } else {
                                response.sendRedirect("/exams");
                            }
                        })
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/login?logout")
                        .permitAll()
                );

        // Required to keep H2 Console functional under Spring Security
        http.csrf(csrf -> csrf.disable());
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}