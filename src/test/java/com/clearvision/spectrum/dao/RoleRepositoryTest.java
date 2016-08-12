package com.clearvision.spectrum.dao;

import com.clearvision.spectrum.dao.master.CompanyDao;
import com.clearvision.spectrum.model.master.Company;
import org.assertj.core.api.StrictAssertions;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.data.repository.config.RepositoryConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;

/**
 * RoleRepositoryTest.
 *
 * @author Zakir Magdum
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = {RepositoryConfiguration.class})
@Transactional("masterTransactionManager")
public class RoleRepositoryTest {

    @Inject
    private CompanyDao companyDao;

    @Test
    public void testRemoveOldPersistentTokens() {
        Company company = new Company();
        company.setCompanyKey("Internal");
        company.setDescription("Test Role");

        Company saved = companyDao.save(company);

        StrictAssertions.assertThat(saved.getId()).isNotNull();

        Company read = companyDao.getOne(saved.getId());

        StrictAssertions.assertThat(company.getCompanyKey().equals(read.getCompanyKey())).isTrue();
        StrictAssertions.assertThat(company.getDescription().equals(read.getDescription())).isTrue();

    }
}
