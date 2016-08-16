package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.UserDirectory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDirectoryDao extends JpaRepository<UserDirectory, Long> {
}
