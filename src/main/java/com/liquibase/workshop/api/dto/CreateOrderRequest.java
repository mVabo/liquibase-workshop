package com.liquibase.workshop.api.dto;

import java.util.List;

public record CreateOrderRequest(String customerEmail, List<OrderItemRequest> items) {
}
