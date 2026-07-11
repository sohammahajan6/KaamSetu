package com.hyperlocal.category.internal.web;

import com.hyperlocal.category.internal.CategoryService;
import com.hyperlocal.category.internal.dto.CategoryDtos.CategoryResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
class CategoryController {

    private final CategoryService categoryService;

    CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    List<CategoryResponse> list() {
        return categoryService.list();
    }
}
