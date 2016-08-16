package me.lcardito.spring.model.master;

import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Column;
import javax.persistence.Entity;

@Entity
public class Company extends SimpleModel<Company> {
    @Column(length = 64, unique = true, nullable = false)
    private String companyKey;
    @Column(length = 255)
    private String description;
    @Column(length = 255)
    private String address;
    @Column
    private boolean enabled;

    public Company merge(Company company) {
        this.companyKey = company.companyKey;
        this.description = company.description;
        this.address = company.address;
        this.enabled = company.enabled;
        return this;
    }

    public String getCompanyKey() {
        return companyKey;
    }

    public void setCompanyKey(String companyKey) {
        this.companyKey = companyKey;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
