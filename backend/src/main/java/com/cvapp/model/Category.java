package com.cvapp.model;

import java.util.Arrays;
import java.util.List;

public enum Category {

    TECH(List.of(
            "développeur", "developpeur", "developer", "ingénieur logiciel", "software",
            "backend", "frontend", "fullstack", "full stack", "data scientist", "data engineer",
            "devops", "cloud", "cybersécurité", "cybersecurite", "analyste it", "it analyst",
            "architecte", "mobile", "flutter", "react", "java", "python", "sécurité informatique",
            "intelligence artificielle", "machine learning", "ia", "ai", "blockchain",
            "administrateur système", "systeme", "réseau", "network", "base de données",
            "database", "tech", "informatique", "web"
    )),

    MARKETING(List.of(
            "marketing", "digital marketing", "communication", "brand", "marque",
            "community manager", "social media", "réseaux sociaux", "publicité", "pub",
            "seo", "sem", "content", "rédacteur", "redacteur", "copywriter", "e-commerce",
            "ecommerce", "commercial", "vente", "sales", "business development", "crm",
            "chef de produit", "product manager", "stratégie", "strategie", "relations publiques",
            "media", "médias", "événementiel", "evenementiel", "influence", "croissance", "growth"
    )),

    FINANCE(List.of(
            "finance", "comptable", "comptabilité", "comptabilite", "audit", "auditeur",
            "contrôleur de gestion", "controleur", "trésorier", "tresorier", "analyste financier",
            "financial analyst", "banque", "banking", "investissement", "investment",
            "fiscalité", "fiscalite", "risk", "risque", "actuaire", "bourse", "trading",
            "économiste", "economiste", "budget", "reporting financier", "cfo", "daf",
            "expert comptable", "commissaire aux comptes", "paie", "payroll"
    )),

    RH(List.of(
            "ressources humaines", "rh", "human resources", "hr", "recrutement", "recruteur",
            "talent acquisition", "formation", "développement rh", "drh", "hrbp",
            "relations sociales", "paie", "administration du personnel", "onboarding",
            "gestion des talents", "talent management", "qvt", "bien-être", "bienetre",
            "droit social", "rémunération", "remuneration", "gpec", "sirh", "hris",
            "diversité", "diversite", "inclusion", "culture d'entreprise"
    )),

    JURIDIQUE(List.of(
            "juridique", "juriste", "avocat", "droit", "legal", "légal", "compliance",
            "conformité", "conformite", "contrat", "propriété intellectuelle", "propriete",
            "droit des affaires", "corporate", "litige", "contentieux", "notaire",
            "réglementation", "reglementation", "rgpd", "gdpr", "droit du travail",
            "droit fiscal", "droit commercial", "droit bancaire", "réglementaire",
            "secrétaire juridique", "paralegal", "cabinet"
    ));

    private final List<String> keywords;

    Category(List<String> keywords) {
        this.keywords = keywords;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    /**
     * Classify a job title string into a Category.
     * Strategy: score each category by number of keyword matches,
     * return the highest-scoring one. Defaults to TECH if no match.
     */
    public static Category classify(String postePostule) {
        if (postePostule == null || postePostule.isBlank()) {
            return TECH;
        }
        String normalized = postePostule.toLowerCase().trim();

        Category best = TECH;
        int bestScore = 0;

        for (Category cat : values()) {
            int score = (int) cat.keywords.stream()
                    .filter(normalized::contains)
                    .count();
            if (score > bestScore) {
                bestScore = score;
                best = cat;
            }
        }
        return best;
    }
}
