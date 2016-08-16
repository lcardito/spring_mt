package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.JiraProcess;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessDao extends JpaRepository<JiraProcess, Long> {
//	List<Process> findAll(int limit, String filter);
//	List<Process> findByTitle(String title);
}
