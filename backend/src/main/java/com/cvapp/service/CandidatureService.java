package com.cvapp.service;

import com.cvapp.dto.CandidatureDto;
import com.cvapp.model.Candidature;
import com.cvapp.model.Category;
import com.cvapp.repository.CandidatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidatureService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
    );

    private final CandidatureRepository repository;
    private final CloudinaryService cloudinaryService;

    //Submission

    @Transactional
    public CandidatureDto.SubmitResponse submit(
            CandidatureDto.SubmitRequest request,
            MultipartFile cvFile) throws IOException {

        // 1. Validate file type
        String contentType = cvFile.getContentType();
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Format de fichier non accepté. Veuillez soumettre un PDF ou DOCX.");
        }

        // 2. Check file size (belt-and-suspenders, Spring already limits to 10MB)
        if (cvFile.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Le fichier CV ne doit pas dépasser 10 MB.");
        }

        // 3. Check for duplicate email
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Une candidature avec cet email existe déjà.");
        }

        // 4. Classify the CV into a category
        Category categorie = Category.classify(request.getPostePostule());
        log.info("Candidature classifiée: poste='{}' → catégorie={}",
                request.getPostePostule(), categorie);

        // 5. Upload CV to Cloudinary
        Map<String, String> cloudResult = cloudinaryService.uploadCv(cvFile, request.getEmail());
        String cvUrl = cloudResult.get("url");
        String cvPublicId = cloudResult.get("public_id");

        // 6. Persist to DB — if this fails, we cleanup Cloudinary
        Candidature candidature;
        try {
            candidature = Candidature.builder()
                    .nom(request.getNom().trim())
                    .prenom(request.getPrenom().trim())
                    .email(request.getEmail().trim().toLowerCase())
                    .telephone(request.getTelephone().trim())
                    .postePostule(request.getPostePostule().trim())
                    .cvUrl(cvUrl)
                    .cvPublicId(cvPublicId)
                    .cvFilename(cvFile.getOriginalFilename())
                    .lettreMotivation(request.getLettreMotivation())
                    .categorie(categorie)
                    .build();
            candidature = repository.save(candidature);
        } catch (Exception e) {
            log.error("DB save failed, rolling back Cloudinary upload: {}", cvPublicId);
            cloudinaryService.deleteCv(cvPublicId);
            throw e;
        }

        return CandidatureDto.SubmitResponse.builder()
                .id(candidature.getId())
                .message("Votre candidature a été soumise avec succès.")
                .categorie(categorie.name())
                .categorieLabel(getCategoryLabel(categorie))
                .build();
    }

    // Admin queries

    @Transactional(readOnly = true)
    public Page<CandidatureDto.CandidatureView> findAll(
            Category categorie, String search, int page, int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Candidature> results = repository.findWithFilters(categorie, search, pageable);
        return results.map(CandidatureDto.CandidatureView::from);
    }

    @Transactional(readOnly = true)
    public CandidatureDto.CandidatureView findById(Long id) {
        return repository.findById(id)
                .map(CandidatureDto.CandidatureView::from)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable: " + id));
    }

    @Transactional(readOnly = true)
    public CandidatureDto.StatsResponse getStats() {
        long total = repository.count();

        // Initialize all categories at 0 (to show even empty ones)
        Map<String, Long> parCategorie = Arrays.stream(Category.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        c -> 0L,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        // Fill actual counts
        repository.countByCategorie().forEach(row -> {
            Category cat = (Category) row[0];
            Long count = (Long) row[1];
            parCategorie.put(cat.name(), count);
        });

        return CandidatureDto.StatsResponse.builder()
                .total(total)
                .parCategorie(parCategorie)
                .build();
    }

    public String getSignedDownloadUrl(Long id) {
        Candidature c = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable: " + id));
        return cloudinaryService.generateSignedDownloadUrl(c.getCvPublicId());
    }

    @Transactional
    public void delete(Long id) {
        Candidature c = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable: " + id));
        cloudinaryService.deleteCv(c.getCvPublicId());
        repository.delete(c);
        log.info("Candidature supprimée: id={}", id);
    }

    // Helpers

    private String getCategoryLabel(Category cat) {
        return switch (cat) {
            case TECH -> "Technologie";
            case MARKETING -> "Marketing";
            case FINANCE -> "Finance";
            case RH -> "Ressources Humaines";
            case JURIDIQUE -> "Juridique";
        };
    }
}
