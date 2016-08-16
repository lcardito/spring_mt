package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupDao extends JpaRepository<Group, Long> {
//	List<Group> findAll(int limit, String filter);
//	long countGroupsByUserId(long userId);
//	List<Group> getGroupsByUserId(long userId);
//	boolean groupExists(String name);
//	long countNonSynchronizedExternalGroups();
//	List <Group> getNonSynchronizedExternalGroups(long currentSyncCycleCount);
//	long getMaxSyncCount();
//	List<Group> getAllExternalGroups();
//	void updateAllExternalGroups(List<Group> allExternalGroups, boolean isUserDirectoryActive);
}
