package com.cvapp.dto;

import com.cvapp.model.Candidature;
import com.cvapp.model.Category;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO (Data Transfer Object) class
 *
 * Used to transfer data between:
 * - Controller
 * - Service
 * - Client (frontend)
 */
public class CandidatureDto {

    // Submission Request DTO
    // Used when a user submits a candidature

    @Data // Generates getters, setters, toString, etc.
    public static class SubmitRequest {

        // Candidate last name
        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100)
        private String nom;

        // Candidate first name
        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100)
        private String prenom;

        // Candidate email
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        @Size(max = 150)
        private String email;

        // Candidate phone number
        @NotBlank(message = "Le téléphone est obligatoire")

        // Regex validation for phone number format
        @Pattern(
                regexp = "^[+]?[0-9 \\-().]{7,20}$",
                message = "Numéro de téléphone invalide"
        )
        private String telephone;

        // Position the candidate is applying for
        @NotBlank(message = "Le poste postulé est obligatoire")
        @Size(max = 200)
        private String postePostule;

        // Optional motivation letter
        @Size(
                max = 1000,
                message = "La lettre de motivation ne peut pas dépasser 1000 caractères"
        )
        private String lettreMotivation;
    }

    // Submission Response DTO
    // Returned after successful candidature submission

    @Data
    @Builder // Enables builder pattern
    public static class SubmitResponse {

        // ID of the created candidature
        private Long id;

        // Success message
        private String message;

        // Category name
        private String categorie;

        // Human-readable category label
        private String categorieLabel;
    }


    // Candidature View DTO (Admin)
    // Used to display candidature details in admin dashboard


    @Data
    @Builder
    public static class CandidatureView {

        private Long id;

        // Candidate information
        private String nom;
        private String prenom;
        private String email;
        private String telephone;

        // Applied position
        private String postePostule;

        // CV information
        private String cvUrl;
        private String cvFilename;

        // Motivation letter
        private String lettreMotivation;

        // Category enum
        private Category categorie;

        // Category display label
        private String categorieLabel;

        // Submission date
        private LocalDateTime createdAt;

        /**
         * Converts a Candidature entity into a DTO object
         */
        public static CandidatureView from(Candidature c) {

            return CandidatureView.builder()

                    // Copy entity fields into DTO
                    .id(c.getId())
                    .nom(c.getNom())
                    .prenom(c.getPrenom())
                    .email(c.getEmail())
                    .telephone(c.getTelephone())
                    .postePostule(c.getPostePostule())
                    .cvUrl(c.getCvUrl())
                    .cvFilename(c.getCvFilename())
                    .lettreMotivation(c.getLettreMotivation())

                    // Category information
                    .categorie(c.getCategorie())
                    .categorieLabel(categoryLabel(c.getCategorie()))

                    // Submission date
                    .createdAt(c.getCreatedAt())

                    .build();
        }

        /**
         * Converts category enum into readable French label
         */
        private static String categoryLabel(Category cat) {

            return switch (cat) {

                case TECH -> "Technologie";

                case MARKETING -> "Marketing";

                case FINANCE -> "Finance";

                case RH -> "Ressources Humaines";

                case JURIDIQUE -> "Juridique";
            };
        }
    }

    // Statistics Response DTO
    // Used for admin statistics endpoint

    @Data
    @Builder
    public static class StatsResponse {

        // Total number of candidatures
        private long total;

        // Number of candidatures per category
        private Map<String, Long> parCategorie;
    }
}