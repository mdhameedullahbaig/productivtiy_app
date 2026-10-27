package com.chronos.productivity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "reminders")
public class ReminderEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", nullable = false)
    private String dueDate;

    @Column(name = "due_time", length = 10)
    private String dueTime;

    @Column(name = "priority", length = 20)
    private String priority = "medium";

    @Column(name = "category", length = 50)
    private String category = "work";

    @Column(name = "completed", nullable = false)
    private boolean completed = false;

    @Column(name = "completed_at")
    private String completedAt;

    @Column(name = "snoozed_until")
    private String snoozedUntil;

    public ReminderEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getDueTime() { return dueTime; }
    public void setDueTime(String dueTime) { this.dueTime = dueTime; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getSnoozedUntil() { return snoozedUntil; }
    public void setSnoozedUntil(String snoozedUntil) { this.snoozedUntil = snoozedUntil; }
}
