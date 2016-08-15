package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectDao extends JpaRepository<Project, Long> {
//	List<Project> findAll(int limit, String filter);
//	Project findById(Long appId);
//	long count();
}
