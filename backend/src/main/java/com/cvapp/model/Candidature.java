package com.cvapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity class representing a candidature in the database
 */
@Entity // Marks this class as a JPA entity
@Table(name = "candidatures") // Database table name
public class Candidature {

    // Primary key
    @Id

    // Auto-increment ID generation
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Candidate last name
    @Column(nullable = false, length = 100)
    private String nom;

    // Candidate first name
    @Column(nullable = false, length = 100)
    private String prenom;

    // Candidate email
    // Must be unique
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // Candidate phone number
    @Column(nullable = false, length = 20)
    private String telephone;

    // Position the candidate is applying for
    @Column(nullable = false, length = 200)
    private String postePostule;

    // Cloudinary URL of uploaded CV
    @Column(nullable = false, length = 500)
    private String cvUrl;

    // Cloudinary public ID used for deletion/download
    @Column(nullable = false, length = 300)
    private String cvPublicId;

    // Original CV filename
    @Column(length = 255)
    private String cvFilename;

    // Optional motivation letter
    @Column(length = 1000)
    private String lettreMotivation;

    // Candidate category (TECH, RH, etc.)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category categorie;

    // Date and time when candidature was created
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Default constructor required by JPA
     */
    public Candidature() {}

    /**
     * Automatically called before saving entity
     * Sets creation date
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


    // Getters
    // Used to read object values

    public Long getId()                  { return id; }

    public String getNom()               { return nom; }

    public String getPrenom()            { return prenom; }

    public String getEmail()             { return email; }

    public String getTelephone()         { return telephone; }

    public String getPostePostule()      { return postePostule; }

    public String getCvUrl()             { return cvUrl; }

    public String getCvPublicId()        { return cvPublicId; }

    public String getCvFilename()        { return cvFilename; }

    public String getLettreMotivation()  { return lettreMotivation; }

    public Category getCategorie()       { return categorie; }

    public LocalDateTime getCreatedAt()  { return createdAt; }

    // Setters
    // Used to modify object values


    public void setId(Long id) {
        this.id = id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setPostePostule(String postePostule) {
        this.postePostule = postePostule;
    }

    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }

    public void setCvPublicId(String cvPublicId) {
        this.cvPublicId = cvPublicId;
    }

    public void setCvFilename(String cvFilename) {
        this.cvFilename = cvFilename;
    }

    public void setLettreMotivation(String l) {
        this.lettreMotivation = l;
    }

    public void setCategorie(Category categorie) {
        this.categorie = categorie;
    }

  
    // Builder Pattern
    // Makes object creation cleaner and easier


    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        // Builder fields
        private String nom;
        private String prenom;
        private String email;
        private String telephone;
        private String postePostule;

        private String cvUrl;
        private String cvPublicId;
        private String cvFilename;

        private String lettreMotivation;

        private Category categorie;

        // Builder methods

        public Builder nom(String v) {
            this.nom = v;
            return this;
        }

        public Builder prenom(String v) {
            this.prenom = v;
            return this;
        }

        public Builder email(String v) {
            this.email = v;
            return this;
        }

        public Builder telephone(String v) {
            this.telephone = v;
            return this;
        }

        public Builder postePostule(String v) {
            this.postePostule = v;
            return this;
        }

        public Builder cvUrl(String v) {
            this.cvUrl = v;
            return this;
        }

        public Builder cvPublicId(String v) {
            this.cvPublicId = v;
            return this;
        }

        public Builder cvFilename(String v) {
            this.cvFilename = v;
            return this;
        }

        public Builder lettreMotivation(String v) {
            this.lettreMotivation = v;
            return this;
        }

        public Builder categorie(Category v) {
            this.categorie = v;
            return this;
        }

        /**
         * Creates and returns a Candidature object
         */
        public Candidature build() {

            Candidature c = new Candidature();

            // Assign builder values to object
            c.nom              = this.nom;
            c.prenom           = this.prenom;
            c.email            = this.email;
            c.telephone        = this.telephone;
            c.postePostule     = this.postePostule;

            c.cvUrl            = this.cvUrl;
            c.cvPublicId       = this.cvPublicId;
            c.cvFilename       = this.cvFilename;

            c.lettreMotivation = this.lettreMotivation;

            c.categorie        = this.categorie;

            return c;
        }
    }
}