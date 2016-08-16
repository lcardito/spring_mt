package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDao extends JpaRepository<User, Long> {
//	long count();
//	List<User> findAll(int limit, String filter);
//
//	long countUsersByGroupId(long groupId);
//	List<User> getUsersByGroupId(long groupId);
//	boolean userExists(String name);
//
//	void addUserToGroup(User user, Group group);
//	void removeUserFromGroup(User user, Group group);
//
//	long getMaxSyncCount();
//	long countNonSynchronizedExternalUsers(long syncCycle);
//	List <User> getNonSynchronizedExternalUsers(long currentSyncCycleCount);
//	long countExternalUsers();
//	List <User> getExternalUsers();
//	void updateExternalUsers(List <User> users, boolean isUseDirectoryActive);
//
    Optional<User> findByName(String username);
}
