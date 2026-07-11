package com.hyperlocal.category.internal;

import com.hyperlocal.category.internal.dto.CategoryDtos.CategoryResponse;
import com.hyperlocal.category.internal.dto.CategoryDtos.CreateCategoryRequest;
import com.hyperlocal.category.internal.dto.CategoryDtos.UpdateCategoryRequest;
import com.hyperlocal.common.ApiException;
import com.hyperlocal.events.CategoryDeleted;
import com.hyperlocal.events.CategoryUpserted;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final ServiceCategoryRepository categories;
    private final ApplicationEventPublisher events;

    CategoryService(ServiceCategoryRepository categories, ApplicationEventPublisher events) {
        this.categories = categories;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categories.findAllByOrderByNameAsc().stream()
                .map(CategoryService::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        if (categories.existsByNameIgnoreCase(request.name().trim())) {
            throw ApiException.conflict("A category with this name already exists.");
        }
        ServiceCategory category = new ServiceCategory(
                UUID.randomUUID(),
                request.name().trim(),
                slugify(request.name()),
                request.description().trim(),
                request.icon().trim(),
                request.basePrice(),
                request.active(),
                request.longDescription(),
                request.includes(),
                request.estimatedDuration(),
                request.whyUs(),
                request.tips());
        categories.save(category);
        events.publishEvent(new CategoryUpserted(category.getId(), category.getName(), category.isActive()));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(UUID id, UpdateCategoryRequest request) {
        ServiceCategory category = categories.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found."));
        String name = request.name() == null ? null : request.name().trim();
        // Mirrors the mock: slug follows the name on rename.
        category.update(
                name,
                name == null ? null : slugify(name),
                request.description(),
                request.icon(),
                request.basePrice(),
                request.active(),
                request.longDescription(),
                request.includes(),
                request.estimatedDuration(),
                request.whyUs(),
                request.tips());
        categories.save(category);
        events.publishEvent(new CategoryUpserted(category.getId(), category.getName(), category.isActive()));
        return toResponse(category);
    }

    @Transactional
    public void delete(UUID id) {
        if (!categories.existsById(id)) {
            throw ApiException.notFound("Category not found.");
        }
        try {
            categories.deleteById(id);
            categories.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw ApiException.conflict(
                    "This category has providers or bookings attached. Deactivate it instead.");
        }
        events.publishEvent(new CategoryDeleted(id));
    }

    private static String slugify(String name) {
        return name.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-");
    }

    private static CategoryResponse toResponse(ServiceCategory c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getSlug(), c.getDescription(),
                c.getIcon(), c.getBasePrice(), c.isActive(),
                c.getLongDescription(), c.getIncludes(), c.getEstimatedDuration(),
                c.getWhyUs(), c.getTips());
    }
}
