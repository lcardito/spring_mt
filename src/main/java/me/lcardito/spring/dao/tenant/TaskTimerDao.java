package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.TaskTimer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskTimerDao extends JpaRepository<TaskTimer, Long> {
//	TaskTimer createTask(User user, Application application, String remoteId, long startTime);
//	void deleteTask(Long userId);
//	TaskTimer getTask(Long userId);
//	List<TaskTimer> getTasks(Long user);
}
