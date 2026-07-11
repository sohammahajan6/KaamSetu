package com.hyperlocal.category.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "service_category")
public class ServiceCategory {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String icon;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "long_description")
    private String longDescription = "";

    @Column(columnDefinition = "text[]")
    private List<String> includes = List.of();

    @Column(name = "estimated_duration")
    private String estimatedDuration = "";

    @Column(name = "why_us", columnDefinition = "text[]")
    private List<String> whyUs = List.of();

    @Column
    private String tips = "";

    protected ServiceCategory() {
        // JPA
    }

    public ServiceCategory(UUID id, String name, String slug, String description,
            String icon, BigDecimal basePrice, boolean active) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.icon = icon;
        this.basePrice = basePrice;
        this.active = active;
    }

    /** Full constructor including rich customer-facing fields. */
    public ServiceCategory(UUID id, String name, String slug, String description,
            String icon, BigDecimal basePrice, boolean active,
            String longDescription, List<String> includes,
            String estimatedDuration, List<String> whyUs, String tips) {
        this(id, name, slug, description, icon, basePrice, active);
        this.longDescription = longDescription != null ? longDescription : "";
        this.includes = includes != null ? includes : List.of();
        this.estimatedDuration = estimatedDuration != null ? estimatedDuration : "";
        this.whyUs = whyUs != null ? whyUs : List.of();
        this.tips = tips != null ? tips : "";
    }

    public void update(String name, String slug, String description, String icon,
            BigDecimal basePrice, Boolean active, String longDescription,
            List<String> includes, String estimatedDuration,
            List<String> whyUs, String tips) {
        if (name != null) this.name = name;
        if (slug != null) this.slug = slug;
        if (description != null) this.description = description;
        if (icon != null) this.icon = icon;
        if (basePrice != null) this.basePrice = basePrice;
        if (active != null) this.active = active;
        if (longDescription != null) this.longDescription = longDescription;
        if (includes != null) this.includes = includes;
        if (estimatedDuration != null) this.estimatedDuration = estimatedDuration;
        if (whyUs != null) this.whyUs = whyUs;
        if (tips != null) this.tips = tips;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public String getIcon() { return icon; }
    public BigDecimal getBasePrice() { return basePrice; }
    public boolean isActive() { return active; }
    public String getLongDescription() { return longDescription; }
    public List<String> getIncludes() { return includes; }
    public String getEstimatedDuration() { return estimatedDuration; }
    public List<String> getWhyUs() { return whyUs; }
    public String getTips() { return tips; }
}
