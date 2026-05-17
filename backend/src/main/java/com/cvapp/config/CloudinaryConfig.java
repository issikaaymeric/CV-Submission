/* This import defines the home folder or namespace for this file 
Cette importation definie le namespace pour ce fichier */

package com.cvapp.config;

/* Import pre-written code from cloudinary so I can reuse them in my code
Importer les codes pre-écrit de cloudinary afin de les réutiliser dans mon code */

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/* It is a spring boot annotation, it contains setup instructions and configurations settings for
 the application */
 
@Configuration

/* This class contains configuration settings for Cloudinary 
Cette classe contient des configurations pour Cloudinary */

public class CloudinaryConfig {

    /* The value annotation checks into the application's properties file
    for a setting named cloudinary.cloud-name. It takes that value and save it safely into the cloudName variable */
    /* Cette annotation vérifie le fichier de propriétés de l'application
    pour un paramètre nommé cloudinary.cloud-name. Elle prend cette valeur
    et la sauvegarde en toute sécurité dans la variable cloudName */

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    /* Cette annotation vérifie le fichier de propriétés de l'application
     pour un paramètre nommé cloudinary.api-key. Elle prend cette valeur
      et la sauvegarde en toute sécurité dans la variable apiKey */

    @Value("${cloudinary.api-key}")
    private String apiKey;

    /* Cette annotation vérifie le fichier de propriétés de l'application
     pour un paramètre nommé cloudinary.api-secret. Elle prend cette valeur
      et la sauvegarde en toute sécurité dans la variable apiSecret */

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /* This method creates a Cloudinary bean with the configured settings
     Cette méthode crée un bean Cloudinary avec les paramètres configurés */

    @Bean

    /*This is a cloudinary method that initializes the Cloudinary instance */
    /* Cette méthode initialise l'instance Cloudinary */

    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}
