package com.chronos.productivity.controller;

import com.chronos.productivity.entity.CalendarEventEntity;
import com.chronos.productivity.entity.ReminderEntity;
import com.chronos.productivity.repository.CalendarEventRepository;
import com.chronos.productivity.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class ProductivityController {

    @Autowired
    private CalendarEventRepository eventRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    // --- Events Database Endpoints ---

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventEntity>> getEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @PostMapping("/events")
    public ResponseEntity<CalendarEventEntity> createEvent(@RequestBody CalendarEventEntity event) {
        if (event.getId() == null || event.getId().isBlank()) {
            event.setId("evt-" + System.currentTimeMillis());
        }
        CalendarEventEntity saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Reminders Database Endpoints ---

    @GetMapping("/reminders")
    public ResponseEntity<List<ReminderEntity>> getReminders() {
        return ResponseEntity.ok(reminderRepository.findAll());
    }

    @PostMapping("/reminders")
    public ResponseEntity<ReminderEntity> createReminder(@RequestBody ReminderEntity reminder) {
        if (reminder.getId() == null || reminder.getId().isBlank()) {
            reminder.setId("rem-" + System.currentTimeMillis());
        }
        ReminderEntity saved = reminderRepository.save(reminder);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/reminders/{id}/toggle")
    public ResponseEntity<ReminderEntity> toggleReminder(@PathVariable String id) {
        return reminderRepository.findById(id).map(reminder -> {
            boolean nextState = !reminder.isCompleted();
            reminder.setCompleted(nextState);
            reminder.setCompletedAt(nextState ? Instant.now().toString() : null);
            ReminderEntity updated = reminderRepository.save(reminder);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable String id) {
        reminderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
