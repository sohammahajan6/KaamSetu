package com.hyperlocal.admin.internal;

import com.hyperlocal.admin.internal.dto.AdminDashboard.CategoryRevenue;
import com.hyperlocal.admin.internal.dto.AdminDashboard.RecentBooking;
import com.hyperlocal.admin.internal.dto.AdminDashboard.StatsResponse;
import com.hyperlocal.admin.internal.dto.AdminDashboard.StatusBreakdown;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final JdbcTemplate jdbc;

    AdminService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        long totalUsers = jdbc.queryForObject("select count(*) from users", Long.class);
        long totalCustomers = jdbc.queryForObject("select count(*) from users where role = 'CUSTOMER'", Long.class);
        long totalProviders = jdbc.queryForObject("select count(*) from users where role = 'PROVIDER'", Long.class);
        long totalAdmins = jdbc.queryForObject("select count(*) from users where role = 'ADMIN'", Long.class);
        long pendingProviders = jdbc.queryForObject("select count(*) from provider_profile where verification_status = 'PENDING'", Long.class);
        long verifiedProviders = jdbc.queryForObject("select count(*) from provider_profile where verification_status = 'VERIFIED'", Long.class);
        long totalBookings = jdbc.queryForObject("select count(*) from booking", Long.class);
        long activeBookings = jdbc.queryForObject("select count(*) from booking where status in ('REQUESTED','ACCEPTED','IN_PROGRESS')", Long.class);
        long completedBookings = jdbc.queryForObject("select count(*) from booking where status in ('COMPLETED','RATED')", Long.class);
        long cancelledBookings = jdbc.queryForObject("select count(*) from booking where status = 'CANCELLED'", Long.class);
        long totalReviews = jdbc.queryForObject("select count(*) from review", Long.class);
        BigDecimal totalRevenue = jdbc.queryForObject("select coalesce(sum(amount), 0) from payment where status = 'PAID'", BigDecimal.class);
        int providerCategories = jdbc.queryForObject("select count(distinct category_id) from provider_profile", Integer.class);

        List<StatusBreakdown> statusBreakdown = jdbc.query(
                "select status, count(*) as cnt from booking group by status order by cnt desc",
                (rs, row) -> new StatusBreakdown(rs.getString("status"), rs.getLong("cnt")));

        List<RecentBooking> recentBookings = jdbc.query(
                "select id, category_name, customer_name, provider_name, status, price, created_at from booking order by created_at desc limit 10",
                (rs, row) -> new RecentBooking(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("category_name"),
                        rs.getString("customer_name"),
                        rs.getString("provider_name"),
                        rs.getString("status"),
                        rs.getBigDecimal("price"),
                        rs.getTimestamp("created_at").toInstant().toString()));

        List<CategoryRevenue> categoryRevenue = jdbc.query(
                "select b.category_name, count(distinct b.id) as bookings, coalesce(sum(p.amount), 0) as revenue " +
                "from booking b left join payment p on p.booking_id = b.id and p.status = 'PAID' " +
                "group by b.category_name order by revenue desc",
                (rs, row) -> new CategoryRevenue(
                        rs.getString("category_name"),
                        rs.getLong("bookings"),
                        rs.getBigDecimal("revenue")));

        return new StatsResponse(
                totalUsers, totalCustomers, totalProviders, totalAdmins,
                pendingProviders, verifiedProviders,
                totalBookings, activeBookings, completedBookings, cancelledBookings,
                totalReviews, totalRevenue, providerCategories,
                statusBreakdown, recentBookings, categoryRevenue);
    }

    @Transactional(readOnly = true)
    public long debugCountUsers() {
        return jdbc.queryForObject("select count(*) from users", Long.class);
    }

    @Transactional(readOnly = true)
    public String exportBookingsCsv() {
        List<String> lines = new java.util.ArrayList<>();
        lines.add("ID,Category,Customer,Provider,Status,Price,Created At");
        jdbc.query(
                "select id, category_name, customer_name, provider_name, status, price, created_at from booking order by created_at desc",
                (rs, row) -> {
                    String id = rs.getString("id");
                    String category = "\"" + rs.getString("category_name").replace("\"", "\"\"") + "\"";
                    String customer = "\"" + rs.getString("customer_name").replace("\"", "\"\"") + "\"";
                    String provider = "\"" + rs.getString("provider_name").replace("\"", "\"\"") + "\"";
                    String status = rs.getString("status");
                    String price = rs.getBigDecimal("price") != null ? rs.getBigDecimal("price").toString() : "0";
                    String createdAt = rs.getTimestamp("created_at").toInstant().toString();
                    lines.add(String.join(",", id, category, customer, provider, status, price, createdAt));
                    return null;
                });
        return String.join("\n", lines) + "\n";
    }
}
