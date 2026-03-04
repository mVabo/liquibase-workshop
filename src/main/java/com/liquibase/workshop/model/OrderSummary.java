package com.liquibase.workshop.model;

import java.math.BigDecimal;

public record OrderSummary(
    Long orderId,
    String customerEmail,
    String customerName,
    String status,
    BigDecimal totalAmount,
    int itemCount
) {
}
