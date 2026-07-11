package com.hyperlocal.review.internal.web;

import com.hyperlocal.common.CurrentUser;
import com.hyperlocal.review.internal.ReviewService;
import com.hyperlocal.review.internal.dto.ReviewDtos.CreateReviewRequest;
import com.hyperlocal.review.internal.dto.ReviewDtos.ReviewResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
class ReviewController {

    private final ReviewService reviewService;

    ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    ReviewResponse create(@Valid @RequestBody CreateReviewRequest request) {
        return reviewService.create(CurrentUser.require(), request);
    }

    @GetMapping("/providers/{id}/reviews")
    List<ReviewResponse> byProvider(@PathVariable UUID id) {
        return reviewService.byProvider(id);
    }
}
