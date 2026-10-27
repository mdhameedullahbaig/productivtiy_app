package com.chronos.productivity.repository;

import com.chronos.productivity.entity.ReminderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<ReminderEntity, String> {
    List<ReminderEntity> findByDueDate(String dueDate);
    List<ReminderEntity> findByCompleted(boolean completed);
}
