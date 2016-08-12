package com.clearvision.spectrum.repository.tenant;

import com.clearvision.spectrum.model.tenant.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findOneByName(String name);
}
