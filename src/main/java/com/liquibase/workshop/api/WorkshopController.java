package com.liquibase.workshop.api;

import com.liquibase.workshop.api.dto.CreateCustomerRequest;
import com.liquibase.workshop.api.dto.CreateOrderRequest;
import com.liquibase.workshop.api.dto.OrderItemRequest;
import com.liquibase.workshop.model.Customer;
import com.liquibase.workshop.model.OrderSummary;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkshopController {

    private final JdbcTemplate jdbcTemplate;

    public WorkshopController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/customers")
    @Operation(summary = "List customers")
    public List<Customer> listCustomers() {
        return jdbcTemplate.query(
            """
                SELECT id, email, display_name
                FROM customers
                ORDER BY id
                """,
            (rs, rowNum) -> new Customer(
                rs.getLong("id"),
                rs.getString("email"),
                rs.getString("display_name")
            )
        );
    }

    @PostMapping("/customers")
    @Operation(summary = "Create a customer, or return existing customer by email")
    public Customer createCustomer(@RequestBody CreateCustomerRequest request) {
        String email = requiredText(request.email(), "email");
        String displayName = requiredText(request.displayName(), "displayName");

        Customer existing = findCustomerByEmail(email);
        if (existing != null) {
            return existing;
        }

        Long customerId = jdbcTemplate.queryForObject(
            """
                INSERT INTO customers (email, display_name)
                VALUES (?, ?)
                RETURNING id
                """,
            Long.class,
            email,
            displayName
        );

        if (customerId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Customer insert did not return id");
        }

        return new Customer(customerId, email, displayName);
    }

    @GetMapping("/orders")
    @Operation(summary = "List order summaries")
    public List<OrderSummary> listOrders() {
        return jdbcTemplate.query(
            """
                SELECT
                    o.id AS order_id,
                    c.email AS customer_email,
                    c.display_name AS customer_name,
                    o.status AS status,
                    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_amount,
                    COALESCE(SUM(oi.quantity), 0) AS item_count
                FROM orders o
                JOIN customers c ON c.id = o.customer_id
                LEFT JOIN order_items oi ON oi.order_id = o.id
                GROUP BY o.id, c.email, c.display_name, o.status
                ORDER BY o.id DESC
                """,
            (rs, rowNum) -> new OrderSummary(
                rs.getLong("order_id"),
                rs.getString("customer_email"),
                rs.getString("customer_name"),
                rs.getString("status"),
                rs.getBigDecimal("total_amount"),
                rs.getInt("item_count")
            )
        );
    }

    @PostMapping("/orders")
    @Transactional
    @Operation(summary = "Create a paid order for a customer email and potion-code items")
    public OrderSummary createOrder(@RequestBody CreateOrderRequest request) {
        String customerEmail = requiredText(request.customerEmail(), "customerEmail");
        List<OrderItemRequest> items = request.items();
        if (items == null || items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "items must not be empty");
        }

        Customer customer = findCustomerByEmail(customerEmail);
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown customer email: " + customerEmail);
        }

        Long orderId = jdbcTemplate.queryForObject(
            """
                INSERT INTO orders (customer_id, status)
                VALUES (?, 'PAID')
                RETURNING id
                """,
            Long.class,
            customer.id()
        );

        if (orderId == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Order insert did not return id");
        }

        for (OrderItemRequest item : items) {
            String potionCode = requiredText(item.potionCode(), "items.potionCode");
            int quantity = item.quantity() == null ? 0 : item.quantity();
            if (quantity <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "items.quantity must be > 0");
            }

            PotionLine potion = findPotionByCode(potionCode);
            if (potion == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown potion code: " + potionCode);
            }

            jdbcTemplate.update(
                """
                    INSERT INTO order_items (order_id, potion_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                    """,
                orderId,
                potion.id(),
                quantity,
                potion.price()
            );
        }

        OrderSummary created = findOrderSummary(orderId);
        if (created == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created order not found");
        }
        return created;
    }

    private Customer findCustomerByEmail(String email) {
        return jdbcTemplate.query(
            """
                SELECT id, email, display_name
                FROM customers
                WHERE email = ?
                """,
            rs -> rs.next()
                ? new Customer(rs.getLong("id"), rs.getString("email"), rs.getString("display_name"))
                : null,
            email
        );
    }

    private PotionLine findPotionByCode(String code) {
        return jdbcTemplate.query(
            """
                SELECT id, price
                FROM potions
                WHERE code = ?
                """,
            rs -> rs.next()
                ? new PotionLine(rs.getLong("id"), rs.getBigDecimal("price"))
                : null,
            code
        );
    }

    private OrderSummary findOrderSummary(Long orderId) {
        return jdbcTemplate.query(
            """
                SELECT
                    o.id AS order_id,
                    c.email AS customer_email,
                    c.display_name AS customer_name,
                    o.status AS status,
                    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_amount,
                    COALESCE(SUM(oi.quantity), 0) AS item_count
                FROM orders o
                JOIN customers c ON c.id = o.customer_id
                LEFT JOIN order_items oi ON oi.order_id = o.id
                WHERE o.id = ?
                GROUP BY o.id, c.email, c.display_name, o.status
                """,
            rs -> rs.next()
                ? new OrderSummary(
                    rs.getLong("order_id"),
                    rs.getString("customer_email"),
                    rs.getString("customer_name"),
                    rs.getString("status"),
                    rs.getBigDecimal("total_amount"),
                    rs.getInt("item_count")
                )
                : null,
            orderId
        );
    }

    private String requiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must not be blank");
        }
        return value.trim();
    }

    private record PotionLine(Long id, BigDecimal price) {
    }
}
