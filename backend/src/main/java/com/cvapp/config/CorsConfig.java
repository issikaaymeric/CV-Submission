package com.cvapp.config;

/*CORS stands for Cross-Origin Resource Sharing, it is a library used to connect your frontend to your
backend APIs. It act as security gatekeeper, deciding which frontend is allowed to communicate with your backend.*/

/* Import necessary tools from Spring Framework to handle web configuration
read application properties, and set up CORS (Cross-Origin Resource Sharing)*/

/* Importer les outils nécessaires de Spring Framework pour gérer la configuration web,
 lire les propriétés de l'application et configurer CORS (Cross-Origin Resource Sharing) */

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
/*This is a class that plugs into the Spring MVC configuration, traffic 
system, giving it the autority to custoize how the web requests are handled */
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/* This class configures Cross-Origin Resource Sharing (CORS) for the application
Cette classe configure le partage de ressources d'origine croisée (CORS) pour l'application */

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /*This looks inside your configuration files (like application.properties)
     for a setting named cors.allowed-origins. It grabs that value */
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply CORS settings to all API endpoints
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // Allow cookies and authentication headers
                .maxAge(3600); // Cache preflight response for 1 hour
    }
}
