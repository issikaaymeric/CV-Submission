package com.cvapp.config;


/*Import necessary tools from Spring Framework to handle security configuration
Importer les outils nécessaires de Spring Framework pour gérer la configuration de sécurité */

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    /*This annotation checks into the application's properties file
    for a setting named admin.username. It takes that value and save it safely into the adminUsername variable */
    /* Cette annotation vérifie le fichier de propriétés de l'application
    pour un paramètre nommé admin.username. Elle prend cette valeur
    et la sauvegarde en toute sécurité dans la variable adminUsername */

    @Value("${admin.username}") // Reads admin username from application.properties
    private String adminUsername;


    /*This annotation checks into the application's properties file
     for a setting named admin.password. It takes that value and save it safely into the adminPassword variable */
    /* Cette annotation vérifie le fichier de propriétés de l'application
     pour un paramètre nommé admin.password. Elle prend cette valeur
     et la sauvegarde en toute sécurité dans la variable adminPassword */

    @Value("${admin.password}") // Reads admin password from application.properties
    private String adminPassword;

    /* This bean creates a password encoder for securely encoding passwords 
    Cette bean crée un codeur de mot de passe sécurisé pour encoder les mots de passe*/

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // BCrypt hashes passwords for better security
    }

    /* This bean sets up an in-memory user details service with an admin user
    Cette bean configure un service de détails utilisateur en mémoire avec un utilisateur admin */
    // Create a temporary admin user
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        var admin = User.builder()
                .username(adminUsername) // Set the admin username from properties
                .password(encoder.encode(adminPassword)) // Encode the admin password for security
                .roles("ADMIN") // Assign the ADMIN role to this user
                .build();
        // Store the admin user in memory
        return new InMemoryUserDetailsManager(admin);
    }

    /* This bean sets up the security filter chain
    Cette bean configure la chaîne de filtres de sécurité */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth  // Configure authorization rules

                // Allow everyone to access candidature API
                // Accorder à tout le monde l'accès à l'API de candidature
                .requestMatchers("/api/candidatures").permitAll()

                // Allow anyone to access candidature routes
                // Accorder à tout le monde l'accès aux routes de candidature
                .requestMatchers("/api/candidatures/**").permitAll()

                // Only ADMIN can access admin routes
                // Seul l'ADMIN peut accéder aux routes admin
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // All other requests require authentication
                // Toutes les autres requêtes nécessitent une authentification
                .anyRequest().authenticated()
            )
            /* Enable basic authentication
            Username + Password */
            /* Activer l'authentification de base
            Nom d'utilisateur + mot de passe */
            .httpBasic(basic -> {});

        return http.build(); // Build the security filter chain
    }
}