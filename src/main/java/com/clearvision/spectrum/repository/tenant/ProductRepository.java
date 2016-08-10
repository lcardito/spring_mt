package com.clearvision.spectrum.repository.tenant;

import com.clearvision.spectrum.model.tenant.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * ProductRepository.
 * @author Zakir Magdum
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findOneByName(String name);
}
