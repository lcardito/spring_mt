package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.ProcessVersion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessVersionDao extends JpaRepository<ProcessVersion, Long> {
//	long countByProcessId(long processId);
//	List<ProcessVersion> findAllByProcessId(long processId);
//	List<ProcessVersion> findAllByProcessId(long processId, int limit);
//	List<ProcessVersion> findAllByProcessId(long processId, int limit, String filter);
//	ProcessVersion findById(long versionId);
//	boolean processContainsSameVersion(long processId, String versionKey);
//	boolean processContainsVersion(long processId, long versionId);
//	ProcessVersion findLastOfSequenceByProcessId(long processId);
}
