package com.clearvision.spectrum.repository.master;

import org.springframework.data.jpa.repository.JpaRepository;
import com.clearvision.spectrum.model.master.Company;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findOneByCompanyKey(String companyKey);
}
