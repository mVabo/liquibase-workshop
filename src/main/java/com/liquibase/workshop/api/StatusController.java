package com.liquibase.workshop.api;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/status")
public class StatusController {

    @GetMapping
    @Operation(summary = "Get workshop service status")
    public Map<String, String> status() {
        return Map.of(
            "app", "liquibase-workshop",
            "status", "ready",
            "time", OffsetDateTime.now().toString()
        );
    }
}
