package com.clearvision.spectrum.repository.master;

import com.clearvision.spectrum.model.master.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * UserRepository.
 * @author Zakir Magdum
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findOneByName(String name);
}
