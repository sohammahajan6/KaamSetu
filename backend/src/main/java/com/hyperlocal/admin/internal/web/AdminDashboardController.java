package com.hyperlocal.admin.internal.web;

import com.hyperlocal.admin.internal.AdminService;
import com.hyperlocal.admin.internal.dto.AdminDashboard.StatsResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminDashboardController {

    private final AdminService adminService;

    AdminDashboardController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    StatsResponse stats() {
        return adminService.getStats();
    }
}
