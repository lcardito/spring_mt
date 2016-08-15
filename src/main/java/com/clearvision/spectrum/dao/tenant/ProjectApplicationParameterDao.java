package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.ProjectApplicationParameter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectApplicationParameterDao extends JpaRepository<ProjectApplicationParameter, Long> {
//	ProjectApplicationParameter findById(Long projectApplicationId, String key);
//	List<ProjectApplicationParameter> findByProjectApplicationId(Long projectApplicationId);
//	List<ProjectApplicationParameter> findByKey(String key);
}
