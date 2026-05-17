package com.cvapp.controller;

import com.cvapp.dto.CandidatureDto;
import com.cvapp.model.Category;
import com.cvapp.service.CandidatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController // Marks this class as a REST API controller
@RequestMapping("/api/admin") // Base URL for all admin routes
@RequiredArgsConstructor // Automatically creates constructor for final fields
public class AdminController {

    // Injects the candidature service
    private final CandidatureService service;

    /**
     * GET /api/admin/candidatures
     *
     * Example:
     * /api/admin/candidatures?categorie=TECH&search=jean&page=0&size=20
     *
     * This endpoint:
     * - Returns all candidatures
     * - Allows filtering by category
     * - Allows searching by keyword
     * - Supports pagination
     */
    @GetMapping("/candidatures")
    public ResponseEntity<Page<CandidatureDto.CandidatureView>> list(

            // Optional category filter
            @RequestParam(required = false) Category categorie,

            // Optional search keyword
            @RequestParam(required = false, defaultValue = "") String search,

            // Page number (default = 0)
            @RequestParam(defaultValue = "0") int page,

            // Number of items per page (default = 20)
            @RequestParam(defaultValue = "20") int size) {

        // Return paginated list of candidatures
        return ResponseEntity.ok(
                service.findAll(categorie, search, page, size)
        );
    }

    /**
     * GET /api/admin/candidatures/{id}
     *
     * Returns details of one candidature by ID
     */
    @GetMapping("/candidatures/{id}")
    public ResponseEntity<CandidatureDto.CandidatureView> getOne(

            // Reads ID from URL
            @PathVariable Long id) {

        // Return candidature details
        return ResponseEntity.ok(service.findById(id));
    }

    /**
     * GET /api/admin/candidatures/{id}/download
     *
     * Returns a signed Cloudinary URL
     * used to securely download the CV
     */
    @GetMapping("/candidatures/{id}/download")
    public ResponseEntity<Map<String, String>> download(

            // Reads candidature ID from URL
            @PathVariable Long id) {

        // Generate signed download URL
        String url = service.getSignedDownloadUrl(id);

        // Return URL in JSON format
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * DELETE /api/admin/candidatures/{id}
     *
     * Deletes candidature from:
     * - Database
     * - Cloudinary storage
     */
    @DeleteMapping("/candidatures/{id}")
    public ResponseEntity<Map<String, String>> delete(

            // Reads candidature ID from URL
            @PathVariable Long id) {

        // Delete candidature
        service.delete(id);

        // Return success message
        return ResponseEntity.ok(
                Map.of("message", "Candidature supprimée avec succès.")
        );
    }

    /**
     * GET /api/admin/stats
     *
     * Returns application statistics
     * Example:
     * - Total candidatures
     * - Number per category
     */
    @GetMapping("/stats")
    public ResponseEntity<CandidatureDto.StatsResponse> stats() {

        // Return statistics data
        return ResponseEntity.ok(service.getStats());
    }
}