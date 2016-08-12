
package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.ProjectApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectApplicationDao extends JpaRepository<ProjectApplication, Long> {
	ProjectApplication findById(Long projectId, Long appId);
	List<ProjectApplication> findByProjectId(Long projectId);
	List<ProjectApplication> findByApplicationId(Long appId);
}
