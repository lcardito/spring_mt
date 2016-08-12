package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Application;
import com.clearvision.spectrum.model.tenant.TaskTimer;
import com.clearvision.spectrum.model.tenant.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskTimerDao extends JpaRepository<TaskTimer, Long> {
	TaskTimer createTask(User user, Application application, String remoteId, long startTime);
	void deleteTask(Long userId);
	TaskTimer getTask(Long userId);
	List<TaskTimer> getTasks(Long user);
}
