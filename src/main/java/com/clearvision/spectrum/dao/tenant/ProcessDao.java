package com.clearvision.spectrum.dao.tenant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcessDao extends JpaRepository<Process, Long> {
	List<Process> findAll(int limit, String filter);
	List<Process> findByTitle(String title);
}
