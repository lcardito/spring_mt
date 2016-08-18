package me.lcardito.spring.repository.master;

import me.lcardito.spring.model.master.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findOneByCompanyKey(String companyKey);
}
