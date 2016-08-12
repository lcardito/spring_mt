package com.clearvision.spectrum.dao.master;

import org.springframework.data.jpa.repository.JpaRepository;
import com.clearvision.spectrum.model.master.Company;

import java.util.Optional;

public interface CompanyDao extends JpaRepository<Company, Long> {
    Optional<Company> findOneByCompanyKey(String companyKey);
}
