package com.liquibase.workshop.api.dto;

public record OrderItemRequest(String potionCode, Integer quantity) {
}
