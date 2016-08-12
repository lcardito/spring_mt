package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.UserDirectory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDirectoryDao extends JpaRepository<UserDirectory, Long> {
}
