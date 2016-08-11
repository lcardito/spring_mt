//package com.clearvision.spectrum.model.master;
//
//import com.clearvision.spectrum.model.SimpleModel;
//
//import javax.persistence.Column;
//import javax.persistence.Entity;
//
///**
// * Role.
// *
// * @author Zakir Magdum
// */
//@Entity
//public class Role extends SimpleModel {
//    @Column(length = 64)
//    private String description;
//
//    public Role merge(Role role) {
//        this.description = role.description;
//        return this;
//    }
//
//    public String getDescription() {
//        return description;
//    }
//
//    public void setDescription(String description) {
//        this.description = description;
//    }
//}
