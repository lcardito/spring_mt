package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.TaskTimer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskTimerDao extends JpaRepository<TaskTimer, Long> {
//	TaskTimer createTask(User user, Application application, String remoteId, long startTime);
//	void deleteTask(Long userId);
//	TaskTimer getTask(Long userId);
//	List<TaskTimer> getTasks(Long user);
}
