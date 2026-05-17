package com.cvapp.controller;

import com.cvapp.dto.CandidatureDto;
import com.cvapp.service.CandidatureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController // Marks this class as a REST API controller
@RequestMapping("/api/candidatures") // Base URL for all routes in this controller
@RequiredArgsConstructor // Automatically creates constructor for final fields
@Slf4j // Enables logging with log.info(), log.error(), etc.
@Validated // Enables validation for request data
public class CandidatureController {

    // Injects the candidature service
    private final CandidatureService service;

    /**
     * Handles candidature submission
     *
     * Endpoint:
     * POST /api/candidatures
     *
     * Receives:
     * - JSON data (candidate information)
     * - CV file
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submit(

            // Receives JSON form data and validates it
            @RequestPart("data") @Valid CandidatureDto.SubmitRequest request,

            // Receives the uploaded CV file
            @RequestPart("cv") MultipartFile cvFile) {

        try {

            // Call service to save candidature and upload CV
            CandidatureDto.SubmitResponse response =
                    service.submit(request, cvFile);

            // Return HTTP 201 Created with response data
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {

            // Return HTTP 400 if user input is invalid
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", e.getMessage()));

        } catch (IOException e) {

            // Log file upload error in console
            log.error("Upload error", e);

            // Return HTTP 500 if file upload fails
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "erreur",
                            "Erreur lors du téléchargement du fichier. Réessayez."
                    ));
        }
    }
}