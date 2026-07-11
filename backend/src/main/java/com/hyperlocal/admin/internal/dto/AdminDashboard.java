package com.hyperlocal.admin.internal.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class AdminDashboard {

    private AdminDashboard() {}

    public record StatsResponse(
            long totalUsers,
            long totalCustomers,
            long totalProviders,
            long totalAdmins,
            long pendingProviders,
            long verifiedProviders,
            long totalBookings,
            long activeBookings,
            long completedBookings,
            long cancelledBookings,
            long totalReviews,
            BigDecimal totalRevenue,
            int providerCategories,
            List<StatusBreakdown> bookingStatusBreakdown,
            List<RecentBooking> recentBookings,
            List<CategoryRevenue> categoryRevenue) {}

    public record StatusBreakdown(String status, long count) {}
    public record RecentBooking(UUID id, String categoryName, String customerName, String providerName, String status, BigDecimal price, String createdAt) {}
    public record CategoryRevenue(String name, long bookings, BigDecimal revenue) {}
}
