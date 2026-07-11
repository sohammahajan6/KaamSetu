package com.hyperlocal.category.internal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {

    List<ServiceCategory> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
}
