//package com.clearvision.spectrum.model.master;
//
//import com.clearvision.spectrum.model.SimpleModel;
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.fasterxml.jackson.annotation.JsonManagedReference;
//
//import javax.persistence.CascadeType;
//import javax.persistence.Column;
//import javax.persistence.Entity;
//import javax.persistence.FetchType;
//import javax.persistence.OneToMany;
//import java.util.Set;
//
//@Entity
//public class Company extends SimpleModel<Company> {
//    @Column(length = 64, unique = true, nullable = false)
//    private String companyKey;
//    @Column(length = 255)
//    private String description;
//    @Column(length = 255)
//    private String address;
//    @Column
//    private boolean enabled;
//
//    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
//    @JsonManagedReference
//    @JsonIgnore
//    private Set<User> users;
//
//    public Company merge(Company company) {
//        this.companyKey = company.companyKey;
//        this.description = company.description;
//        this.address = company.address;
//        this.enabled = company.enabled;
//        // TODO: sync users in case they exists
//        return this;
//    }
//
//    public String getCompanyKey() {
//        return companyKey;
//    }
//
//    public void setCompanyKey(String companyKey) {
//        this.companyKey = companyKey;
//    }
//
//    public String getDescription() {
//        return description;
//    }
//
//    public void setDescription(String description) {
//        this.description = description;
//    }
//
//    public String getAddress() {
//        return address;
//    }
//
//    public void setAddress(String address) {
//        this.address = address;
//    }
//
//    public boolean isEnabled() {
//        return enabled;
//    }
//
//    public void setEnabled(boolean enabled) {
//        this.enabled = enabled;
//    }
//
//    public Set<User> getUsers() {
//        return users;
//    }
//
//    public void setUsers(Set<User> users) {
//        this.users = users;
//    }
//}
