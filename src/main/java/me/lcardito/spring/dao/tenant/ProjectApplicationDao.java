
package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.ProjectApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectApplicationDao extends JpaRepository<ProjectApplication, Long> {
//	ProjectApplication findById(Long projectId, Long appId);
//	List<ProjectApplication> findByProjectId(Long projectId);
//	List<ProjectApplication> findByApplicationId(Long appId);
}
