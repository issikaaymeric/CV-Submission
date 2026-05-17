package com.cvapp.repository;

import com.cvapp.model.Candidature;
import com.cvapp.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Map;

/**
 * Repository layer for Candidature entity
 *
 * This interface is responsible for:
 * - Communicating with the database
 * - Performing CRUD operations
 * - Executing custom queries
 */
@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    /**
     * Find candidatures by category with pagination
     */
    Page<Candidature> findByCategorie(Category categorie, Pageable pageable);

    /**
     * Search candidatures by nom, prenom, or email (case-insensitive)
     */
    Page<Candidature> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String nom,
            String prenom,
            String email,
            Pageable pageable);

    /**
     * Advanced filtering query
     *
     * - Filter by category (optional)
     * - Search in multiple fields (nom, prenom, email, postePostule)
     * - Case-insensitive search
     * - Sorted by newest first (createdAt DESC)
     */
    @Query("""
        SELECT c FROM Candidature c
        WHERE (:categorie IS NULL OR c.categorie = :categorie)
          AND (:search IS NULL OR :search = '' OR
               LOWER(c.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.postePostule) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY c.createdAt DESC
    """)
    Page<Candidature> findWithFilters(
            @Param("categorie") Category categorie,
            @Param("search") String search,
            Pageable pageable);

    /**
     * Count number of candidatures per category
     * Used for statistics dashboard
     *
     * Returns:
     * - Category
     * - Number of candidates in that category
     */
    @Query("SELECT c.categorie, COUNT(c) FROM Candidature c GROUP BY c.categorie")
    java.util.List<Object[]> countByCategorie();

    /**
     * Check if an email already exists in database
     * Used to prevent duplicate applications
     */
    boolean existsByEmail(String email);
}