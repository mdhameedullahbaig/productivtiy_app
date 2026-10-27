package com.chronos.productivity.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class ProductivityController {

    // In-memory synchronized store (backed by MySQL JPA repositories in production)
    private final List<Map<String, Object>> events = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> reminders = Collections.synchronizedList(new ArrayList<>());

    // --- Events Endpoints ---
    @GetMapping("/events")
    public ResponseEntity<List<Map<String, Object>>> getEvents() {
        return ResponseEntity.ok(events);
    }

    @PostMapping("/events")
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody Map<String, Object> event) {
        if (!event.containsKey("id")) {
            event.put("id", "evt-" + System.currentTimeMillis());
        }
        events.add(0, event);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        events.removeIf(e -> id.equals(e.get("id")));
        return ResponseEntity.noContent().build();
    }

    // --- Reminders Endpoints ---
    @GetMapping("/reminders")
    public ResponseEntity<List<Map<String, Object>>> getReminders() {
        return ResponseEntity.ok(reminders);
    }

    @PostMapping("/reminders")
    public ResponseEntity<Map<String, Object>> createReminder(@RequestBody Map<String, Object> reminder) {
        if (!reminder.containsKey("id")) {
            reminder.put("id", "rem-" + System.currentTimeMillis());
        }
        reminders.add(0, reminder);
        return ResponseEntity.ok(reminder);
    }

    @PatchMapping("/reminders/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleReminder(@PathVariable String id) {
        for (Map<String, Object> r : reminders) {
            if (id.equals(r.get("id"))) {
                boolean completed = Boolean.TRUE.equals(r.get("completed"));
                r.put("completed", !completed);
                return ResponseEntity.ok(r);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable String id) {
        reminders.removeIf(r -> id.equals(r.get("id")));
        return ResponseEntity.noContent().build();
    }
}
