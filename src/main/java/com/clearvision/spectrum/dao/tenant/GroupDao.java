package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupDao extends JpaRepository<Group, Long> {
	List<Group> findAll(int limit, String filter);
	long countGroupsByUserId(long userId);
	List<Group> getGroupsByUserId(long userId);
	boolean groupExists(String name);
	long countNonSynchronizedExternalGroups();
	List <Group> getNonSynchronizedExternalGroups(long currentSyncCycleCount);
	long getMaxSyncCount();
	List<Group> getAllExternalGroups();
	void updateAllExternalGroups(List<Group> allExternalGroups, boolean isUserDirectoryActive);
}
