package com.cvapp.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload a CV file to the cv_submissions folder.
     * Raw delivery type is used so PDFs/DOCX are stored as-is (not transformed).
     */
    public Map<String, String> uploadCv(MultipartFile file, String candidatEmail) throws IOException {
        // Sanitize email for use as part of public_id
        String safeEmail = candidatEmail.replaceAll("[^a-zA-Z0-9]", "_");
        String publicId = "cv_submissions/" + safeEmail + "_" + System.currentTimeMillis();

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "resource_type", "raw",   // required for PDF/DOCX
                        "folder", "cv_submissions",
                        "use_filename", true,
                        "unique_filename", true,
                        "overwrite", false
                )
        );

        String secureUrl = (String) result.get("secure_url");
        String returnedPublicId = (String) result.get("public_id");

        log.info("CV uploaded to Cloudinary: public_id={}", returnedPublicId);

        return Map.of(
                "url", secureUrl,
                "public_id", returnedPublicId
        );
    }

    /**
     * Delete a CV from Cloudinary by its public_id.
     * Called if DB save fails after upload (rollback scenario).
     */
    public void deleteCv(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", "raw"));
            log.info("CV deleted from Cloudinary: public_id={}", publicId);
        } catch (Exception e) {
            log.error("Failed to delete CV from Cloudinary: public_id={}", publicId, e);
        }
    }

    /**
     * Generate a signed download URL valid for 1 hour.
     * Allows admin to download CVs without exposing permanent URLs.
     */
    public String generateSignedDownloadUrl(String publicId) {
        try {
            return cloudinary.url()
                    .resourceType("raw")
                    .signed(true)
                    .generate(publicId);
        } catch (Exception e) {
            log.error("Failed to generate signed URL for: {}", publicId, e);
            throw new RuntimeException("Impossible de générer le lien de téléchargement");
        }
    }
}
